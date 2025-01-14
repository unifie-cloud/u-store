import { useTranslation } from 'next-i18next';
import { Result } from 'antd';

/**
 * UI for the deploying state of an application
 *
 * Show it in case ( isLive=false and isEnabled=true )
 * @param props
 * @returns
 */
export const UnifieDeploying = () => {
  const { t } = useTranslation('unifie');
  return (
    <Result
      status="success"
      title={t('unifie-deploying-title')}
      subTitle={t('unifie-deploying-message')}
    />
  );
};
