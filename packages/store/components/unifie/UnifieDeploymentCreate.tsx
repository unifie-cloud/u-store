import type { ApiResponse } from 'types';
import { useTranslation } from 'next-i18next';
import { iUnifieCluster } from '@/lib/unifie/unifieApi';
import { Button, Select, Spin } from 'antd';
import { useState } from 'react';
import { defaultHeaders } from '@/lib/common';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

export const UnifieDeploymentCreate = (props: {
  teamSlug: string;
  clusterList: iUnifieCluster[];
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cluster, setCluster] = useState(false);
  const clusterList: iUnifieCluster[] = props.clusterList as any;

  const createApplication = async (values: any) => {
    if (!cluster) {
      toast.error('Please select a cluster');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `/api/teams/${props.teamSlug}/unifie-deployment`,
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
