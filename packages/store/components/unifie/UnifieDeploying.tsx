import { useTranslation } from 'next-i18next';
import { Result, Space } from 'antd';

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
    <>
      <Result
        status="success"
        title={t('unifie-deploying-title')}
        subTitle={t('unifie-deploying-message')}
      />
      <iframe
        width="100%"
        height="420"
        src="https://www.youtube.com/embed/O2SMceQucJg?si=DNyuX7ln1my0Dxpq"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </>
  );
};
