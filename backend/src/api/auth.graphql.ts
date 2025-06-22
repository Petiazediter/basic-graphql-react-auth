import { Resolvers } from "@generated/graphql";
import { UserRoleInOrganization } from "../../generated/prisma";

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
      return null;
    }
  }
};