import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { sendEvent } from '@/lib/svix';
import { Role } from '@prisma/client';
import {
  getCurrentUserWithTeam,
  removeTeamMember,
  throwIfNoTeamAccess,
} from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { countTeamMembers, updateTeamMember } from 'models/teamMember';
import { validateMembershipOperation } from '@/lib/rbac';
import {
  deleteMemberSchema,
  updateMemberSchema,
  validateWithSchema,
} from '@/lib/zod';
import UnifieApi, { iUnifieApplication } from '@/lib/unifie/unifieApi';

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
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, DELETE, POST');
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
    return { data: null };
  }

  //  Send deployment for this team
  const unifieApi = new UnifieApi();
  await unifieApi.init({
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
  });

  const applications: iUnifieApplication[] =
    await unifieApi.Application_getApplicationsList();

  const currentTeamApplication: iUnifieApplication | null =
    applications.find((app) => app.name === `store-${teamMember.id}`) || null;

  res.status(200).json({ data: currentTeamApplication });
};

// Delete team deployment
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_member', 'delete');

  const { memberId } = validateWithSchema(
    deleteMemberSchema,
    req.query as { memberId: string }
  );

  await validateMembershipOperation(memberId, teamMember);

  const teamMemberRemoved = await removeTeamMember(teamMember.teamId, memberId);

  await sendEvent(teamMember.teamId, 'member.removed', teamMemberRemoved);

  sendAudit({
    action: 'member.remove',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('member.removed');

  res.status(200).json({ data: {} });
};

// Create team deployment
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getCurrentUserWithTeam(req, res);
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(user, 'team', 'read');

  if (!process.env.UNIFIE_API_KEY || !process.env.UNIFIE_API_URL) {
    return { data: null };
  }

  //  Send deployment for this team
  const unifieApi = new UnifieApi();
  await unifieApi.init({
    apiKey: process.env.UNIFIE_API_KEY,
    apiHost: process.env.UNIFIE_API_URL,
  });

  const applications: iUnifieApplication[] =
    await unifieApi.Application_getApplicationsList();

  const currentTeamApplication: iUnifieApplication | null =
    applications.find((app) => app.name === `store-${teamMember.id}`) || null;

  res.status(200).json({ data: currentTeamApplication });
};
