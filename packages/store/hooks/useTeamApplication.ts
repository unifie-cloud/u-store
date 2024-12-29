import fetcher from '@/lib/fetcher';
import { iUnifieApplication } from '@/lib/unifie/unifieApi';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import type { ApiResponse } from 'types';

const useTeamApplication = (slug?: string) => {
  const { query, isReady } = useRouter();

  const teamSlug = slug || (isReady ? query.slug : null);

  const { data, error, isLoading } = useSWR<
    ApiResponse<iUnifieApplication | null>
  >(teamSlug ? `/api/teams/${teamSlug}/unifie-deployment` : null, fetcher);

  return {
    isLoading,
    isError: error,
    application: data?.data,
  };
};

export default useTeamApplication;
