import { getSession } from '@/lib/session';
import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { iApolloResolver, iQlContext } from 'apollo/backend';
import { GraphqlApiResolvers } from 'apollo/resolvers';

const InitSchema = `
  scalar JSON

  type Query{
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

const resolvers = {
  Query: GraphqlApiResolvers.map((a: iApolloResolver) => a.Query).reduce(
    (acc, cur) => ({ ...acc, ...cur }),
    {}
  ),
  Mutation: GraphqlApiResolvers.map((a: iApolloResolver) => a.Mutation).reduce(
    (acc, cur) => ({ ...acc, ...cur }),
    {}
  ),
};

const server = new ApolloServer({
  resolvers: resolvers,
  typeDefs:
    InitSchema +
    GraphqlApiResolvers.map((a: iApolloResolver) => a.schema).join('\n'),
});

export default startServerAndCreateNextHandler(server, {
  context: async (req, res): Promise<iQlContext> => {
    const session = await getSession(req, res);
    if (!session) {
      throw new Error('Not authenticated');
    }
    return {
      req: req,
      res: res,
      session: session,
    };
  },
});
