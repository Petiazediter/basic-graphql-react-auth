import { Resolvers } from "@generated/graphql";

export const typeDef = `
    extend type Query { 
        ok: Boolean
    }
`;

export const resolvers: Resolvers = {
  Query: {
    ok: () => true,
  },
};