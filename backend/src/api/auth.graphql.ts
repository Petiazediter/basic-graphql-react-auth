import { Resolvers } from "@generated/graphql";
import { UserRoleInOrganization } from "../../generated/prisma";
import bcrypt from "bcrypt";
import validator from "validator"
import jwt from "jsonwebtoken";

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
    
    extend type Mutation {
      createUser(input: CreateUserInput!): String
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

      if ( createdUser && process.env.JWT_SECRET ) {
        const token = jwt.sign({ 
          userId: createdUser.id,
        }, process.env.JWT_SECRET, { expiresIn: "10m" })

        return token;
      }
      
      throw new Error("Failed to create user");
    }
  }
};