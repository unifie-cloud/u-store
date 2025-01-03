import { unifieApi } from '@/lib/unifie/unifieApi';
import { iApolloResolver, iQlContext, QL } from '../../backend';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { ApiError } from '@/lib/errors';
import { iUnifieApplication, iUnifieCluster } from 'types/unifieApi';
import { iUnifieFormSchema } from 'types/unifieForms';

function getAppUuid(teamId: string) {
  return `store-team-${teamId}`;
}

export const unifieStoreFrontendApi: iApolloResolver = {
  schema: `#graphql
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

    type VersionModel {
      id: Int
      name: String
      title: String
      description: String
    }

    type ClusterModel {
      id: Int
      name: String
      regionName: String
      title: String
      kubernetesVersion: String
      cloudProvider: String
      loadBalancerURL: String
      loadBalancerType: String
      allowToAddDeployments: Boolean
      lastSyncTime: Float
      noSyncTime: Float
    }
    type ClusterListAnswer {
        data: [ClusterModel]
        error: String
    }

    type iUpdateApplication {
      error: String
    }

    type iCreateApplication {
      error: String
      extUuid: String
    }

    type iUnifieConfigSchema {
      schema: JSON
      uiSchema: JSON
    }

    type iUnifieApplication {
      id: Int
      name: String
      domain: String
      extUuid: String
      extData: JSON
      projectId: Int
      specsErrors: String
      specsWarns: String
      isReady: Boolean
      isEnabled: Boolean
      region: String
      version: String
      ClusterModel: ClusterModel
      VersionModel: VersionModel
      env: String
      services: String
      tags: String
    }

    input iUnifieApplicationInput {
      name: String
      domain: String
      extUuid: String
      extData: JSON
      projectId: Int
      isReady: Boolean
      isEnabled: Boolean
      region: Int
      version: Int
      env: JSON
      services: JSON
      tags: [Int]
    }
      

    # The "Query" type is special: it lists all of the available queries that
    # clients can execute, along with the return type for each. In this
    # case, the "books" query returns an array of zero or more Books (defined above).
    extend type Query { 
      """
      Returns clusters list. get request
      """
      uStore_getClusters: [ClusterModel]
      uStore_getApplication(teamSlug: String!): iUnifieApplication
      uStore_getApplicationConfigSchema: iUnifieConfigSchema
    }

    extend type Mutation {
        uStore_createApplication(clusterId: Int!, teamSlug: String!): iCreateApplication
        uStore_updateApplication(teamSlug: String!, config: iUnifieApplicationInput!): iUpdateApplication
    }
  `,
  Query: {
    uStore_getApplication: QL(
      async (
        args: { teamSlug: string },
        context: iQlContext
      ): Promise<iUnifieApplication | null> => {
        //  Send deployment for this team
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'read');
        const appUuid = getAppUuid(teamMember.team.id);

        const currentTeamApplication: iUnifieApplication | null =
          await unifieApi.Application_getApplicationByExtUuid(appUuid);

        return currentTeamApplication;
      }
    ),
    uStore_getClusters: QL(
      async (args: any, context: iQlContext): Promise<iUnifieCluster[]> => {
        const res = (
          (await unifieApi.Clusters_getClustersForTemplate()) || []
        ).filter((cluster) => cluster.allowToAddDeployments);
        return res;
      }
    ),
    uStore_getApplicationConfigSchema: QL(
      async (
        args: any,
        context: iQlContext
      ): Promise<{ schema: iUnifieFormSchema }> => {
        return {
          schema: {
            properties: [
              //  add properties
              {
                type: 'boolean',
                label: 'unifie-app-enabled',
                name: 'isEnabled',
              },
              // {
              //   type: 'string',
              //   label: 'unifie-app-enabled',
              //   name: 'textTest',
              // },
            ],
          },
        };
      }
    ),
  },
  Mutation: {
    uStore_updateApplication: QL(
      async (
        args: { teamSlug: string; config: any },
        context: iQlContext
      ): Promise<{ error: string }> => {
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'update');
        const appUuid = getAppUuid(teamMember.team.id);

        const currentTeamApplication: iUnifieApplication | null =
          await unifieApi.Application_getApplicationByExtUuid(appUuid);
        if (!currentTeamApplication) {
          throw new ApiError(
            404,
            `Application not found for team ${teamMember.team.slug} with uuid ${appUuid}`
          );
        }

        const answer = await unifieApi.Application_updateByExtUuid(
          appUuid,
          args.config
        );

        return {
          error: answer?.error,
        };
      }
    ),
    uStore_createApplication: QL(
      async (
        args: { clusterId: number; teamSlug: string },
        context: iQlContext
      ): Promise<{ error?: String; extUuid: String }> => {
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'update');
        const appUuid = getAppUuid(teamMember.team.id);

        const currentTeamApplication: iUnifieApplication | null =
          await unifieApi.Application_getApplicationByExtUuid(appUuid);
        if (currentTeamApplication) {
          return {
            extUuid: currentTeamApplication?.extUuid,
          };
        }

        const newApplication = await unifieApi.Application_createFromTemplate({
          name: `store-team-${teamMember.team.slug}`,
          extUuid: appUuid,
          extData: {
            teamId: teamMember.team.id,
          },
          clusterId: args.clusterId,
        });

        await unifieApi.Application_updateByExtUuid(appUuid, {
          isEnabled: true,
          isReady: true,
        });

        return {
          extUuid: newApplication?.extUuid,
        };
      }
    ),
  },
};
