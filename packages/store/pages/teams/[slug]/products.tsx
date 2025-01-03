import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import { iUnifieApplication } from '@/lib/unifie/unifieApi';
import useTeam from 'hooks/useTeam';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { Button, Result, Skeleton } from 'antd';
import { UnifieDeploymentOverview } from '@/components/unifie/UnifieDeploymentOverview';
import { UnifieDeploymentCreate } from '@/components/unifie/UnifieDeploymentCreate';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';

const Products: NextPageWithLayout = (props) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const { isLoading, team } = useTeam();

  const app = useQuery(
    gql`
      query uStore_getApplication($teamSlug: String!) {
        uStore_getApplication(teamSlug: $teamSlug) {
          id
          name
          domain
          isEnabled
          ClusterModel {
            title
          }
          VersionModel {
            name
          }
        }
      }
    `,
    {
      skip: !team?.slug,
      variables: {
        teamSlug: team?.slug,
      },
    }
  );

  const { data } = useSWR(
    team?.slug ? `/api/teams/${team?.slug}/payments/products` : null,
    fetcher
  );

  if (isLoading || !team || !data || app.loading) {
    return <Skeleton active={true} loading={true}></Skeleton>;
  }

  const hasSubscription = (data?.data?.subscriptions || []).find(
    (s) => s.active
  );

  const currentTeamApplication: iUnifieApplication | null =
    app?.data?.uStore_getApplication || null;

  if (!hasSubscription) {
    return (
      <Result
        title={t('unifie-app-no-subscription')}
        extra={
          <Button
            type="primary"
            key="console"
            onClick={() => {
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
    return <UnifieDeploymentCreate teamSlug={team.slug} />;
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

  return {
    props: {
      ...(req.locale
        ? await serverSideTranslations(req.locale, ['common'])
        : {}),
    },
  };
}

export default Products;
