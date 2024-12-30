import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import UnifieApi, {
  iUnifieApplication,
  iUnifieCluster,
} from '@/lib/unifie/unifieApi';
import useTeam from 'hooks/useTeam';
import useCanAccess from 'hooks/useCanAccess';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { Button, Result, Skeleton } from 'antd';
import useTeamApplication from 'hooks/useTeamApplication';
import { UnifieDeploymentOverview } from '@/components/unifie/UnifieDeploymentOverview';
import { UnifieDeploymentCreate } from '@/components/unifie/UnifieDeploymentCreate';
import { useRouter } from 'next/router';

const Products: NextPageWithLayout = (props) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { isLoading, isError, team } = useTeam();
  const app = useTeamApplication();

  const { data } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/payments/products` : null,
    fetcher
  );

  if (isLoading || !team || !data || app.isLoading) {
    return <Skeleton active={true} loading={true}></Skeleton>;
  }

  const hasSubscription = (data?.data?.subscriptions || []).find(
    (s) => s.active
  );

  const currentTeamApplication: iUnifieApplication | null =
    app?.application as any;

  if (!hasSubscription) {
    return (
      <Result
        title={t('unifie-app-no-subscription')}
        extra={
          <Button
            type="primary"
            key="console"
            onClick={(e) => {
              router.push(`/teams/${team?.slug}/billing`);
            }}
          >
            {t('unifie-app-choose-a-plan')}
          </Button>
        }
      />
    );
  }

  if (!currentTeamApplication) {
    // We need to create a new application
    return (
      <UnifieDeploymentCreate
        clusterList={props.clusterList as iUnifieCluster[]}
        teamSlug={team.slug}
      />
    );
  }

  // We have an application - show status here
  return (
    <UnifieDeploymentOverview
      app={currentTeamApplication}
      teamSlug={team.slug}
    />
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
