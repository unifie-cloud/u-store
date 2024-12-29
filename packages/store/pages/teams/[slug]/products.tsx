import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ApiResponse, NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import UnifieApi, {
  iUnifieApplication,
  iUnifieCluster,
} from '@/lib/unifie/unifieApi';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { Button, Result, Select, Skeleton, Spin } from 'antd';
import { useRouter } from 'next/router';
import useTeamApplication from 'hooks/useTeamApplication';
import { useState } from 'react';
import { defaultHeaders } from '@/lib/common';
import toast from 'react-hot-toast';

const Products: NextPageWithLayout = (props) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();
  const app = useTeamApplication();
  const { data } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/payments/products` : null,
    fetcher
  );
  const [cluster, setCluster] = useState(false);

  if (isLoading || !team || !data || app.isLoading) {
    return <Skeleton active={true} loading={true}></Skeleton>;
  }

  const hasSubscription = (data?.data?.subscriptions || []).find(
    (s) => s.active
  );
  const clusterList: iUnifieCluster[] = props.clusterList as any;
  const currentTeamApplication: iUnifieApplication | null =
    app?.application as any;

  if (!hasSubscription) {
    return (
      <Result
        title="You don't have any subscription"
        extra={
          <Button
            type="primary"
            key="console"
            onClick={(e) => {
              router.push(`/teams/${team?.slug}/billing`);
            }}
          >
            Choose a plan
          </Button>
        }
      />
    );
  }

  const createApplication = async (values: any) => {
    if (!cluster) {
      toast.error('Please select a cluster');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/teams/${team.slug}/unifie-deployment`,
        {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({
            clusterId: cluster,
          }),
        }
      );

      setLoading(false);

      if (!response.ok) {
        const json = (await response.json()) as ApiResponse;
        toast.error(json.error.message);
        return;
      }

      toast.success(t('team-removed-successfully'));
      router.reload();
    } catch (e: any) {
      toast.error(e?.message || e);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  if (!currentTeamApplication) {
    // We need to create a new application
    return (
      <div className="p-3">
        <br />
        <p className="text-sm">Select a cluster to deploy this application</p>
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
          Deploy {loading && <Spin />}
        </Button>
      </div>
    );
  }

  // We have an application - show status here
  return (
    <div className="p-3">
      <p className="text-sm">
        {team.slug} - {team.name} - {team.id}
      </p>

      <p className="text-sm">
        Application: {currentTeamApplication.name} - {currentTeamApplication.id}
      </p>
      <p>{currentTeamApplication.ClusterModel?.title}</p>

      <br />
      {JSON.stringify(currentTeamApplication)}
      <br />

      <Button type="primary" className="mt-3">
        Update
      </Button>
    </div>
  );
};

export async function getServerSideProps(req: GetServerSidePropsContext) {
  if (!process.env.UNIFIE_API_KEY || !process.env.UNIFIE_API_URL) {
    return {
      notFound: true,
    };
  }

  const unifieApi = new UnifieApi();
  await unifieApi.init({
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
  });
  const clusterList: iUnifieCluster[] =
    await unifieApi.Clusters_getClustersList();

  return {
    props: {
      ...(req.locale
        ? await serverSideTranslations(req.locale, ['common'])
        : {}),
      clusterList: clusterList.filter(
        (cluster) => cluster.allowToAddDeployments
      ),
    },
  };
}

export default Products;
