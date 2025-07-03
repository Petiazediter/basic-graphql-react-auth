import { ApplicationAccessLevel, Resolvers } from "@generated/graphql";
import { GraphQLError } from "graphql";

export const typeDef = `
    extend type Query { 
        ok: Boolean
        isUserAuthenticated: Boolean
        checkMyRoleAgainst(role: ApplicationAccessLevel!, isExact: Boolean!): Boolean
    }
`;

export const resolvers: Resolvers = {
  Query: {
    ok: () => true,
    isUserAuthenticated: async (_parent, _args, ctx) => {
      ctx.rbac.app().user().ensure();
      return true;
    },
    checkMyRoleAgainst: async (_parent, args, ctx) => {
      switch (args.role) {
        case ApplicationAccessLevel.Guest:
          return args.isExact ? ctx.rbac.app().guest().exact().view() : ctx.rbac.app().guest().view();
        case ApplicationAccessLevel.User:
          return args.isExact ? ctx.rbac.app().user().exact().view() : ctx.rbac.app().user().view();
        case ApplicationAccessLevel.Admin:
          return args.isExact ? ctx.rbac.app().admin().exact().view() : ctx.rbac.app().admin().view();
        case ApplicationAccessLevel.SuperAdmin:
          return args.isExact ? ctx.rbac.app().superAdmin().exact().view() : ctx.rbac.app().superAdmin().view();
        default:
          throw new GraphQLError('This should not happen. (checkMyRoleAgainst)', {
            extensions: {
              code: 'INTERNAL_SERVER_ERROR',
            }
          })
      }
    }
  },
};