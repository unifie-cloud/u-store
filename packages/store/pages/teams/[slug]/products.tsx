import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';
import { useTranslation } from 'next-i18next';
import UnifieApi from '@/lib/unifie/unifieApi';

const Products: NextPageWithLayout = (props) => {
  const { t } = useTranslation('common');

  return (
    <div className="p-3">
      <p className="text-sm">{t('product-placeholder')}</p>
      {JSON.stringify(props.clusterList)}
    </div>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
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
  const clusterList = await unifieApi.Clusters_getClustersList();

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      clusterList,
    },
  };
}

export default Products;
