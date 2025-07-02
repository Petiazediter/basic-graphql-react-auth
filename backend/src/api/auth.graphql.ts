import { Resolvers } from "@generated/graphql";
import { ApplicationAccessLevel, UserRoleInOrganization } from "../../generated/prisma";
import bcrypt from "bcrypt";
import validator from "validator";
import { signAccessToken } from "../jwt";

export const typeDef = `
    extend type Query { 
        ok: Boolean
    }

    enum UserRoleInOrganization {
      ${Object.values(UserRoleInOrganization).join("\n")}
    }

    input UserOrganizationInput {
      organizationId: String!
      role: UserRoleInOrganization!
    }

    input CreateUserInput {
      email: String!
      password: String!
      userOrganization: UserOrganizationInput
    }
    
    input LoginInput {
      email: String!
      password: String!
    }
    
    extend type Mutation {
      createUser(input: CreateUserInput!): String
      login(input: LoginInput!): String
    }
`;

export const resolvers: Resolvers = {
  Mutation: {
    createUser: async (_parent, { input }, ctx) => {
      const { email, password, userOrganization } = input;

      const userWithSameEmailAddress = await ctx.primsaClient.user.findFirst({
        where: {
          email
        }
      });

      if ( userWithSameEmailAddress ) {
        throw new Error("Email address already in use");
      }

      // Validate email address;
      if ( !validator.isEmail(email) ) {
        throw new Error("Invalid email address");
      }
      // Validate password;
      if ( !validator.isStrongPassword(password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }) ) {
        throw new Error("Password is not strong enough");
      }

      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      const orgId = userOrganization?.organizationId;
      if ( orgId ) {
        const organization = await ctx.primsaClient.organization.findUnique({
          where: {
            id: orgId,
          },
        })

        if ( !organization ) {
          throw new Error("Organization not found");
        }
      }

      const createdUser = await ctx.primsaClient.user.create({
        data: {
          email,
          password: hashedPassword,
          applicationAccessLevel: ApplicationAccessLevel.USER,
          ...(userOrganization ? ({
            organizations: {
              create: {
                organizationId: userOrganization.organizationId,
                role: userOrganization.role,
              }
            }
          }) : {})
        },
      })

      if ( createdUser ) {
        const token = signAccessToken({ userId: createdUser.id, applicationAccessLevel: createdUser.applicationAccessLevel }, ctx.res);
        return token;
      }

      throw new Error("Failed to create user");
    },
    login: async (_parent, { input }, ctx) => {
      const { email, password } = input;

      const user = await ctx.primsaClient.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          password: true,
          applicationAccessLevel: true,
        }
      })

      if ( !user ) {
        // If user not found, compare the password with a hashed dummy password to avoid timing attacks
        bcrypt.compareSync(password, "$2b$10$Ca/7HUvYywqMBZMDLj4lR.Av8YJYPDwlpZw4zwlL5VUzRp/0SDLeS");
        throw new Error("User not found");
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if ( !isPasswordValid ) {
        throw new Error("User not found");
      }

      const token = signAccessToken({ 
        userId: user.id,
        applicationAccessLevel: user.applicationAccessLevel,
      }, ctx.res);
      return token;
    }
  }
};