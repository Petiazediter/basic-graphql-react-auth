import { Resolvers } from "@generated/graphql";

export const typeDef = `
    extend type Query { 
        ok: Boolean
        isUserAuthenticated: Boolean
    }
`;

export const resolvers: Resolvers = {
  Query: {
    ok: () => true,
    isUserAuthenticated: async (_parent, _args, ctx) => {
      return !!ctx.userId;
    }
  },
};