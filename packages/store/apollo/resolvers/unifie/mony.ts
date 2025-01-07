import { iApolloResolver, iQlContext, QL } from '../../backend';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { getSubscriptionForTeam } from 'pages/api/teams/[slug]/payments/products';

export const unifieStoreMonyApi: iApolloResolver = {
  schema: `#graphql
   
    extend type Query {  
      uMony_hasActiveSubscription(teamSlug: String!): Boolean 
    }
 
  `,
  Query: {
    uMony_hasActiveSubscription: QL(
      async (
        args: { teamSlug: string },
        context: iQlContext
      ): Promise<boolean> => {
        //  Send deployment for this team
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'read');
        const data = await getSubscriptionForTeam(
          context.session,
          args.teamSlug
        );
        const subscriptions = (data?.subscriptions || []).find((s) => s.active);
        return subscriptions ? true : false;
      }
    ),
  },
  Mutation: {},
};
