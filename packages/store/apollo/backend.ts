import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';

export interface iApolloResolver {
  Query: {
    [key: string]: any;
  };
  Mutation: {
    [key: string]: any;
  };
  schema: string;
}

/**
 * Help function for graphql resolver
 * @param realFn
 * @returns
 */
export const QL = (realFn: any) => {
  return (parent, args, contextValue, info): any => {
    return realFn(args, contextValue);
  };
};

export interface iQlContext {
  req: NextApiRequest;
  res: NextApiResponse;
  session: Session;
}
