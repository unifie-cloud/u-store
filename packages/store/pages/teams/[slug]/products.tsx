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

export const dynamic = 'force-dynamic';

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

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
    return (
      <SafeHydrate>
        <UnifieDeploymentCreate teamSlug={team.slug} />
      </SafeHydrate>
    );
  }

  // We have an application - show status here
  return (
    <SafeHydrate>
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
    </SafeHydrate>
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
