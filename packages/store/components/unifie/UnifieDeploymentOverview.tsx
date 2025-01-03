import { useTranslation } from 'next-i18next';
import { iUnifieApplication } from '@/lib/unifie/unifieApi';
import { Button, Form, Skeleton, Spin, Switch } from 'antd';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getApollo } from 'hooks/useApollo';
import { gql, useQuery } from '@apollo/client';

export const UnifieDeploymentOverview = (props: {
  app: iUnifieApplication;
  teamSlug: string;
}) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const currentTeamApplication: iUnifieApplication =
    props.app as iUnifieApplication;

  const updateApplication = async () => {
    const config = form.getFieldsValue();

    setLoading(true);
    try {
      const response = await getApollo().mutate({
        mutation: gql`
          mutation uStore_updateApplication(
            $teamSlug: String!
            $config: iUnifieApplicationInput!
          ) {
            uStore_updateApplication(teamSlug: $teamSlug, config: $config) {
              error
            }
          }
        `,
        variables: {
          teamSlug: props.teamSlug,
          config,
        },
      });

      setLoading(false);

      if (response.data?.uStore_updateApplication?.error) {
        toast.error(response.data?.uStore_updateApplication?.error);
        return;
      }

      toast.success(t('team-removed-successfully'));
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
      <p className="text-sm">
        {t('unifie-app-Application')}: {currentTeamApplication.name} -{' '}
        {currentTeamApplication.id}
      </p>
      <p>
        {t('unifie-app-cluster')}: {currentTeamApplication.ClusterModel?.title}
      </p>
      <p>
        {t('unifie-app-domain')}:{' '}
        <a href={`https://${currentTeamApplication.domain}`} target="_blank">
          {currentTeamApplication.domain}
        </a>
      </p>

      {currentTeamApplication.VersionModel && (
        <p>
          {t('unifie-app-version')}: {currentTeamApplication.VersionModel?.name}
        </p>
      )}

      <Form
        form={form}
        initialValues={{
          isEnabled: currentTeamApplication.isEnabled,
          //   region: currentTeamApplication.region,
          //   version: currentTeamApplication.version,
          //   env: currentTeamApplication.env,
          //   services: currentTeamApplication.services,
        }}
      >
        <Form.Item label={t('unifie-app-enabled')} name={`isEnabled`}>
          <Switch />
        </Form.Item>

        <Button
          type="primary"
          className="mt-3"
          onClick={updateApplication}
          disabled={loading}
        >
          {t('unifie-app-update')} {loading && <Spin />}
        </Button>
      </Form>
    </div>
  );
};
