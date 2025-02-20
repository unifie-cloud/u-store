import { readJsonConfigFile, unifieApi } from '@/lib/unifie/unifieApi';
import { iApolloResolver, iQlContext, QL } from '../../backend';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { ApiError } from '@/lib/errors';
import {
  iApplicationExtData,
  iUnifieApplication,
  iUnifieCluster,
} from 'types/unifieApi';
import { iUnifieFormSchema } from 'types/unifieForms';
import { getSubscriptionForTeam } from 'pages/api/teams/[slug]/payments/products';
import env from '@/lib/env';
import _ from 'lodash';

function getAppUuid(teamId: string) {
  return `store-team-${teamId}`;
}

interface iVarsMap {
  [varName: string]: any;
}

/**
 * @returns schema.json file from /unifie-configs
 */
async function getAppUIschema(): Promise<{ schema: iUnifieFormSchema }> {
  // Read schema.json file from /unifie-configs
  return await readJsonConfigFile('schema.json');
}

async function getUiConfigValuesFromApp(
  app: iUnifieApplication | null
): Promise<iVarsMap> {
  if (!app) {
    return {};
  }

  const configSchema = await getAppUIschema();
  const configs = {};
  for (let key in configSchema.schema.properties) {
    const val = configSchema.schema.properties[key];

    const varsParsed = /^vars[\[.'"]+(.*?)['"\].]+(.*?)$/.exec(val.name);
    if (varsParsed) {
      // Case for vars['serviceName'].varName (related for helm chart values.yaml file)
      const serviceName = varsParsed[1];
      const varSubPath = varsParsed[2];
      configs[val.name] = _.get(app.vars[serviceName], varSubPath);
    } else {
      configs[val.name] = _.get(app, val.name);
    }
  }
  return configs;
}

export const unifieStoreApplicationApi: iApolloResolver = {
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
      isLive: Boolean 
      isReady: Boolean
      isEnabled: Boolean
      region: Int
      version: Int
      ClusterModel: ClusterModel
      VersionModel: VersionModel
      env: JSON
      services: JSON
      tags: JSON 
      vars: JSON 
    }

    type iUnifieApplicationConfigs {
      application: iUnifieApplication
      configs: JSON
    }
  
    """
    Return JWT token with access to Application monitoring data
    - token - jwt token
    - url - analytics server endpoint
    """
    type MonitoringToken {
      error: String
      token: String
      url: String
    }
    
    """
    Kubernetes pod status
    - labels - pod labels
    - name - pod name
    - nodeName - node name
    - status_phase - pod phase
    - status_startTime - pod start time
    - creationTimestamp - pod creation time
    - containers - pod containers
    - status_conditions - pod conditions
    - status_containerStatuses - pod container statuses
    """
    type k8sPodsStatus {
      labels: JSON
      name: String
      nodeName: String
      status_phase: String
      status_startTime: String
      creationTimestamp: String
      containers: JSON
      status_conditions: JSON
      status_containerStatuses: JSON
    }

    """
    Kubernetes pod Metrics - available if in Kubernetes cluster installed metrics-server
    - labels - pod labels
    - cpu - CPU usage in millicores
    - memory - Memory usage in bytes
    - name - pod name
    - nodeName - node name
    """
    type k8sPodsMetrics {
      labels: JSON
      cpu: Float
      memory: Float
      name: String
      nodeName: String
    }

    type ApplicationPodsMetrics {
      error: String
      metrics: [k8sPodsMetrics]
    }
    type ApplicationPodsStatus {
      error: String
      status: [k8sPodsStatus]
    }
 
    extend type Query { 
      """
      Returns clusters list. get request
      """
      uStore_getClusters: [ClusterModel]
      uStore_getApplication(teamSlug: String!): iUnifieApplicationConfigs
      uStore_getApplicationConfigSchema: iUnifieConfigSchema


      uStore_getPodsMetrics(teamSlug: String!): ApplicationPodsMetrics
      uStore_getPodsStatus(teamSlug: String!): ApplicationPodsStatus
      uStore_getMonitoringToken(teamSlug: String!): MonitoringToken 
    }

    extend type Mutation {
        uStore_createApplication(clusterId: Int!, teamSlug: String!): iCreateApplication
        uStore_updateApplication(teamSlug: String!, config: JSON!): iUpdateApplication
    }
  `,
  Query: {
    uStore_getPodsMetrics: QL(
      async (args: { teamSlug: string }, context: iQlContext): Promise<any> => {
        //  Send deployment for this team
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'read');
        const appUuid = getAppUuid(teamMember.team.id);
        return await unifieApi.Application_getPodsMetricsByExtUuid(appUuid);
      }
    ),
    uStore_getPodsStatus: QL(
      async (args: { teamSlug: string }, context: iQlContext): Promise<any> => {
        //  Send deployment for this team
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'read');
        const appUuid = getAppUuid(teamMember.team.id);
        return await unifieApi.Application_getPodsStatusByExtUuid(appUuid);
      }
    ),
    uStore_getMonitoringToken: QL(
      async (
        args: { teamSlug: string },
        context: iQlContext
      ): Promise<{ token: string; url: string; error: string }> => {
        //  Send deployment for this team
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'read');
        const appUuid = getAppUuid(teamMember.team.id);
        return await unifieApi.Application_getMonitoringTokenByExtUuid(appUuid);
      }
    ),
    uStore_getApplication: QL(
      async (
        args: { teamSlug: string },
        context: iQlContext
      ): Promise<{
        application: iUnifieApplication | null;
        configs: any | null;
      }> => {
        //  Send deployment for this team
        const teamMember = await getTeamMember(
          context.session.user.id,
          args.teamSlug
        );
        throwIfNotAllowed(teamMember, 'team', 'read');
        const appUuid = getAppUuid(teamMember.team.id);

        const currentTeamApplication: iUnifieApplication | null =
          await unifieApi.Application_getApplicationByExtUuid(appUuid);

        return {
          application: currentTeamApplication,
          configs: await getUiConfigValuesFromApp(currentTeamApplication),
        };
      }
    ),
    uStore_getClusters: QL(
      async (args: any, context: iQlContext): Promise<iUnifieCluster[]> => {
        const res = (await unifieApi.Clusters_getClustersForTemplate()) || [];

        if (env.unifie.clusterWhitelist.length > 0) {
          return res.filter((cluster) => {
            return env.unifie.clusterWhitelist.includes(String(cluster.id));
          });
        }

        return res.filter((cluster) => cluster.allowToAddDeployments);
      }
    ),
    uStore_getApplicationConfigSchema: QL(
      async (
        args: any,
        context: iQlContext
      ): Promise<{ schema: iUnifieFormSchema }> => {
        // Store deployment schema
        // Read schema.json file from /unifie-configs
        return await getAppUIschema();
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

        // Read schema.json file from /unifie-configs
        const data = await getAppUIschema();

        const cleanObj = {};

        const keys = Object.keys(args.config || {});

        // Cut off all properties that are not in schema.json file
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const prop = data.schema.properties.find((p) => p.name === key);
          if (!prop) {
            console.warn(`Property ${key} is not in schema.json file`);
            return {
              error: `Property ${key} is not in schema.json file`,
            };
          }
          cleanObj[key] = args.config[key];
        }

        console.log(
          `uStore_updateApplication: ${teamMember.team.id}`,
          cleanObj
        );

        const answer = await uStore_updateApplication(
          teamMember.team.id,
          cleanObj
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

        let subscriptions: any = [];
        if (env.unifie.subscriptionRequired) {
          const data = await getSubscriptionForTeam(
            context.session,
            args.teamSlug
          );
          subscriptions = data?.subscriptions || []; // .find((s) => s.active);
          if (!subscriptions) {
            throw new ApiError(400, 'No subscription found');
          }
        }

        const extData: iApplicationExtData = {
          teamId: teamMember.team.id,
          subscriptions: subscriptions,
        };

        if (env.unifie.clusterWhitelist.length > 0) {
          if (!env.unifie.clusterWhitelist.includes(String(args.clusterId))) {
            throw new ApiError(
              400,
              `Cluster with id ${args.clusterId} is not allowed for this team`
            );
          }
        }

        const newApplication = await unifieApi.Application_createFromTemplate({
          name: `store-team-${teamMember.team.slug}`,
          extUuid: appUuid,
          extData: extData,
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

export async function uStore_updateApplication(teamId: string, config: any) {
  const appUuid = getAppUuid(teamId);
  const currentTeamApplication: iUnifieApplication | null =
    await unifieApi.Application_getApplicationByExtUuid(appUuid);
  if (!currentTeamApplication) {
    return {
      error: `Application not found for team ${teamId} with uuid ${appUuid}`,
      code: `NotFound`,
    };
    // throw new ApiError(
    //   404,
    //   `Application not found for team ${teamMember.team.slug} with uuid ${appUuid}`
    // );
  }

  return {
    ...(await unifieApi.Application_updateByExtUuid(appUuid, config)),
    code: null,
  };
}
