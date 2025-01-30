import type { NextApiRequest, NextApiResponse } from 'next';
import env from '@/lib/env';

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
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    console.error(`Error in packages/store/pages/api/config/index.ts:`, error);
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get teams
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    unifie: {
      showMetrics: env.unifie.showMetrics,
      showAvailability: env.unifie.showAvailability,
      subscriptionRequired: env.unifie.subscriptionRequired,
    },
  });
};
