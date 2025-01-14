import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import useTeam from 'hooks/useTeam';
import { Button, Col, Result, Row, Skeleton, Tabs } from 'antd';
import { UnifieDeploymentOverview } from '@/components/unifie/UnifieDeploymentOverview';
import { UnifieDeploymentCreate } from '@/components/unifie/UnifieDeploymentCreate';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { iUnifieApplication } from 'types/unifieApi';
import { PodsMetrics } from '@/components/unifie/ResourcesStates/PodsMetrics';
import { DeploymentMonitoring } from '@/components/unifie/DeploymentMonitoring';
import env from '@/lib/env';
import { useEffect } from 'react';
import { UnifieDeploying } from '@/components/unifie/UnifieDeploying';

export const dynamic = 'force-dynamic';

const Products: NextPageWithLayout = () => {
  const router = useRouter();
  const { t } = useTranslation('unifie');

  const { isLoading, team } = useTeam();

  const app = useQuery(
    gql`
      query uStore_getApplication($teamSlug: String!) {
        uStore_getApplication(teamSlug: $teamSlug) {
          id
          name
          domain
          isLive
          isEnabled
          ClusterModel {
            title
          }
          VersionModel {
            name
          }
        }
        uMony_hasActiveSubscription(teamSlug: $teamSlug)
      }
    `,
    {
      skip: !team?.slug,
      variables: {
        teamSlug: team?.slug,
      },
    }
  );

  useEffect(() => {
    return app.stopPolling;
  }, []);
  useEffect(() => {
    if (app?.data?.uStore_getApplication) {
      const isLive = app.data?.uStore_getApplication?.isLive;
      if (!isLive && app.data?.uStore_getApplication?.isEnabled === true) {
        app.startPolling(15000);
      } else {
        app.stopPolling();
      }
    }
  }, [app?.data?.uStore_getApplication]);

  const isLive = app.data?.uStore_getApplication?.isLive;
  const isEnabled = app.data?.uStore_getApplication?.isEnabled;
  const showStartingUI = !isLive && isEnabled;

  if (isLoading || !team || app.loading) {
    return <Skeleton active={true} loading={true}></Skeleton>;
  }

  const hasSubscription = app?.data?.uMony_hasActiveSubscription;

  const currentTeamApplication: iUnifieApplication | null =
    app?.data?.uStore_getApplication || null;

  if (!hasSubscription && env.unifie.subscriptionRequired) {
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

  if (showStartingUI) {
    // UI for the deploying state of an application
    return <UnifieDeploying />;
  }

  // We have an application - show status here
  return (
    <Tabs>
      <Tabs.TabPane tab={t('unifie-app-Overview')} key="overview">
        <Row>
          <Col span={12}>
            <UnifieDeploymentOverview
              app={currentTeamApplication}
              teamSlug={team.slug}
            />
          </Col>
          {env.unifie.showPods && (
            <Col span={12}>
              <PodsMetrics teamSlug={team.slug} />
            </Col>
          )}
        </Row>
      </Tabs.TabPane>
      {(env.unifie.showArability || env.unifie.showMetrics) && (
        <Tabs.TabPane tab={t('unifie-app-Monitoring')} key="monitoring">
          <DeploymentMonitoring teamSlug={team.slug} />
        </Tabs.TabPane>
      )}
    </Tabs>
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
        ? await serverSideTranslations(req.locale, ['common', 'unifie'])
        : {}),
    },
  };
}

export default Products;
