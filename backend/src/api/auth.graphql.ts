export const typeDef = `
    extend type Query { 
        ok: Boolean
    }
`;

export const resolvers = {
  Query: {
    ok: () => true,
  },
};