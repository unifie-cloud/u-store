import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { useRouter } from 'next/router';
import type { ApiResponse } from 'types';
import { Invitation, Team } from '@prisma/client';

type Response = ApiResponse<Invitation & { team: Team }>;

let _gConfig: any = null;

const useConfig = () => {
  // if (_gConfig) {
  //   debugger;
  //   return {
  //     isLoading: false,
  //     error: null,
  //     data: _gConfig,
  //   };
  // }

  const q = useSWR<Response>(`/api/config`, fetcher);

  if (q.data) {
    // debugger;
    _gConfig = q.data;
  }

  return q;
};

export default useConfig;
