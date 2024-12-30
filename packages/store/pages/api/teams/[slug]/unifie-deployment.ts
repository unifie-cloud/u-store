import { ApiError } from '@/lib/errors';
import { getCurrentUserWithTeam, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { validateWithSchema } from '@/lib/zod';
import UnifieApi, {
  iUnifieApplication,
  iUnifieApplicationInput,
} from '@/lib/unifie/unifieApi';
import { z } from 'zod';

function getAppUuid(teamId: string) {
  return `store-team-${teamId}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      // case 'DELETE':
      //   await handleDELETE(req, res);
      //   break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PATCH':
        await handlePATCH(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE, POST, PATCH');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get team deployment
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(user, 'team', 'read');

  if (!process.env.UNIFIE_API_KEY || !process.env.UNIFIE_API_URL) {
    throw new ApiError(403, `UNIFIE_API_KEY or UNIFIE_API_URL is not set`);
  }

  //  Send deployment for this team
  const unifieApi = new UnifieApi();
  await unifieApi.init({
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
  });

  const currentTeamApplication: iUnifieApplication | null =
    await unifieApi.Application_getApplicationByExtUuid(
      getAppUuid(teamMember.team.id)
    );

  res.status(200).json({ data: currentTeamApplication });
};

// Delete team deployment
// const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
//   throw new ApiError(501, 'Not implemented');
// };

export const appCreateSchema = z.object({
  clusterId: z.number().int(),
});

// Create team deployment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(user, 'team', 'read');

  const { clusterId } = validateWithSchema(appCreateSchema, req.body);

  if (!process.env.UNIFIE_API_KEY || !process.env.UNIFIE_API_URL) {
    throw new ApiError(403, `UNIFIE_API_KEY or UNIFIE_API_URL is not set`);
  }

  //  Send deployment for this team
  const unifieApi = new UnifieApi();
  await unifieApi.init({
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
  });

  const appUuid = getAppUuid(teamMember.team.id);
  const currentTeamApplication: iUnifieApplication | null =
    await unifieApi.Application_getApplicationByExtUuid(appUuid);
  if (currentTeamApplication) {
    res.status(200).json({
      data: {
        extUuid: currentTeamApplication?.extUuid,
        id: currentTeamApplication?.id,
      },
    });
    return;
  }

  const newApplication = await unifieApi.Application_createFromTemplate({
    name: `store-team-${teamMember.team.slug}`,
    extUuid: appUuid,
    extData: {
      teamId: teamMember.team.id,
    },
    clusterId: clusterId,
  });

  await unifieApi.Application_updateByExtUuid(appUuid, {
    isEnabled: true,
    isReady: true,
  });

  res.status(200).json({
    data: {
      extUuid: newApplication?.extUuid,
      id: newApplication?.id,
    },
  });
  return;
};

const unifieServiceSchema = z.set(
  z.object({
    vars: z.set(z.string()).optional(),
    'service.evershop.enabled': z.boolean().optional(),
  })
);

export const appUpdateSchema = z.object({
  // domain: domain,
  isEnabled: z.boolean().optional(),
  region: z.number().int().optional(),
  version: z.number().int().optional(),
  env: z.set(z.string()).optional(),
  services: unifieServiceSchema.optional(),
});

// Update team deployment
const handlePATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(user, 'team', 'read');

  const app: iUnifieApplicationInput = validateWithSchema(
    appUpdateSchema,
    req.body
  ) as any;

  if (!process.env.UNIFIE_API_KEY || !process.env.UNIFIE_API_URL) {
    throw new ApiError(403, `UNIFIE_API_KEY or UNIFIE_API_URL is not set`);
  }

  //  Send deployment for this team
  const unifieApi = new UnifieApi();
  await unifieApi.init({
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
  });

  const appUuid = getAppUuid(teamMember.team.id);
  const currentTeamApplication: iUnifieApplication | null =
    await unifieApi.Application_getApplicationByExtUuid(appUuid);
  if (!currentTeamApplication) {
    throw new ApiError(
      404,
      `Application not found for team ${teamMember.team.slug} with uuid ${appUuid}`
    );
  }

  const answer = await unifieApi.Application_updateByExtUuid(appUuid, app);

  res.status(200).json({
    data: {
      error: answer?.error,
    },
  });
  return;
};
