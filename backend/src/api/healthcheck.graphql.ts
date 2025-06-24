import { Resolvers } from "@generated/graphql";
import { GraphQLError } from "graphql";

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
      if (!ctx.userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: {
            code: 'UNAUTHORIZED'
          }
        });
      }
      return true;
    }
  },
};