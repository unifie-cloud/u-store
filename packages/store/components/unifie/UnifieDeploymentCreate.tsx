import { useTranslation } from 'next-i18next';
import { Button, Select, Skeleton, Spin } from 'antd';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { getApollo } from 'hooks/useApollo';
import { iUnifieCluster } from 'types/unifieApi';

export const UnifieDeploymentCreate = (props: { teamSlug: string }) => {
  const { t } = useTranslation('unifie');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cluster, setCluster] = useState(false);

  const gQuery = useQuery(
    gql`
      query uStore_getClusters {
        uStore_getClusters {
          id
          name
          regionName
          title
        }
      }
    `,
    {}
  );
  if (gQuery.loading) {
    return <Skeleton active={true} loading={true}></Skeleton>;
  }

  const clusterList: iUnifieCluster[] = gQuery?.data?.uStore_getClusters || [];

  const createApplication = async () => {
    if (!cluster) {
      toast.error('Please select a cluster');
      return;
    }
    setLoading(true);

    try {
      const response = await getApollo().mutate({
        mutation: gql`
          mutation uStore_createApplication(
            $clusterId: Int!
            $teamSlug: String!
          ) {
            uStore_createApplication(
              clusterId: $clusterId
              teamSlug: $teamSlug
            ) {
              error
              extUuid
            }
          }
        `,
        variables: {
          clusterId: cluster,
          teamSlug: props.teamSlug,
        },
      });

      setLoading(false);

      if (response.data?.uStore_createApplication?.error) {
        toast.error(response.data?.uStore_createApplication?.error);
      }
      if (response.data?.uStore_createApplication?.extUuid) {
        toast.success(t('unifie-app-create-successfully'));
        router.reload();
        return;
      }
    } catch (e: any) {
      toast.error(e?.message || e);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // We have an application - show status here
  return (
    <div className="p-3">
      <br />
      <p className="text-sm">{t('unifie-app-select-cluster-to-deploy')}</p>
      <br />
      <Select style={{ width: '100%' }} onChange={setCluster}>
        {clusterList.map((cluster) => (
          <Select.Option key={cluster.id} value={cluster.id}>
            {cluster.name}
          </Select.Option>
        ))}
      </Select>

      <Button
        type="primary"
        className="mt-3"
        onClick={createApplication}
        disabled={loading}
      >
        {t('unifie-app-deploy')} {loading && <Spin />}
      </Button>
    </div>
  );
};
