import { useTranslation } from 'next-i18next';
import { Button, Form, Spin } from 'antd';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getApollo } from 'hooks/useApollo';
import { gql, useQuery } from '@apollo/client';
import { iUnifieApplication } from 'types/unifieApi';
import { UnifieForm } from './UnifieForm';

export const UnifieDeploymentOverview = (props: {
  app: iUnifieApplication;
  teamSlug: string;
}) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);

  const formSchema = useQuery(
    gql`
      query uStore_getApplicationConfigSchema {
        uStore_getApplicationConfigSchema {
          schema
        }
      }
    `,
    {}
  );
  const schema = formSchema.data?.uStore_getApplicationConfigSchema?.schema;
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

  if (!schema) {
    return <div>Loading...</div>;
  }

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
        {/* <Form.Item label={t('unifie-app-enabled')} name={`isEnabled`}>
          <Switch />
        </Form.Item> */}

        <UnifieForm schema={schema} />
        <br />
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
