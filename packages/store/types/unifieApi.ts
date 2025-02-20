export interface iUnifieCluster {
  id: number;
  name: string;
  regionName: string;
  title: string;
  cloudProvider: string;
  allowToAddDeployments: boolean;
}

export interface iDeploymentServiceVarsMap {
  [varName: string]: any;
}

export interface iDeploymentVarsMap {
  [serviceName: string]: iDeploymentServiceVarsMap;
}
export interface iUnifieApplication {
  id: number;
  name: string;
  domain: string;
  extUuid: string;
  extData: any;
  projectId: number;
  specsErrors: string;
  specsWarns: string;
  isReady: boolean;
  isEnabled: boolean;
  region: string;
  version: string;
  vars: iDeploymentVarsMap;
  ClusterModel: {
    id: number;
    title: string;
  };
  VersionModel: {
    id: number;
    name: string;
    title: string;
    description: string;
  };
  env: string;
  services: string;
  tags: string;
}
export interface iUnifieApplicationInput {
  name: string;
  domain: string;
  extUuid: string;
  extData: any;
  projectId: number;
  isReady: boolean;
  isEnabled: boolean;
  region: number;
  version: number;
  env: any;
  services: any;
  tags: number[];
}

export interface UnifieApiOptions {
  apiKey: string;
  apiHost: string;
  defaultTemplateId?: number;
}

/**
 * Interface for application extended data (extData)
 * You can add any fields you need. extData is a JSON field in the database
 *
 * @Note:
 * This interface is used to validate the data, it just a typescript interface for type validation during development
 */
export interface iApplicationExtData {
  teamId: string;
  subscriptions: any[];
}
