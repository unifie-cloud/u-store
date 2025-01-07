import { NextApiRequest, NextApiResponse } from 'next';

import { getStripeCustomerId } from '@/lib/stripe';
import { getSession } from '@/lib/session';
import { getTeamMember } from 'models/team';
import { getAllServices } from 'models/service';
import { getAllPrices } from 'models/price';
import { getByCustomerId } from 'models/subscription';
import { teamSlugSchema, validateWithSchema } from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case 'GET':
        await handleGET(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET');
        res.status(405).json({
          error: { message: `Method ${req.method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

export const getSubscriptionForTeam = async (session, teamSlug: string) => {
  if (!session) {
    throw new Error('Unauthorized');
  }
  const teamMember = {
    ...(await getTeamMember(session.user.id, teamSlug)),
    user: {
      ...session.user,
    },
  };

  if (!teamMember) {
    throw new Error('You do not have access to this team');
  }

  // const session = await getSession(req, res);
  // const teamMember = await throwIfNoTeamAccess(req, res);
  if (!session?.user?.id) {
    throw Error('Could not get user');
  }
  const customerId = await getStripeCustomerId(teamMember, session);

  const [subscriptions, products, prices] = await Promise.all([
    getByCustomerId(customerId),
    getAllServices(),
    getAllPrices(),
  ]);

  // create a unified object with prices associated with the product
  const productsWithPrices = products.map((product: any) => {
    product.prices = prices.filter((price) => price.serviceId === product.id);
    return product;
  });

  // Subscriptions with product and price
  const _subscriptions: any[] = subscriptions.map((subscription: any) => {
    const _price = prices.find((p) => p.id === subscription.priceId);
    if (!_price) {
      return undefined;
    }
    const subscriptionProduct = products.find((p) => p.id === _price.serviceId);

    return {
      ...subscription,
      product: subscriptionProduct,
      price: _price,
    };
  });

  return {
    products: productsWithPrices,
    subscriptions: (_subscriptions || []).filter((s) => !!s),
  };
};

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);
  const { slug } = validateWithSchema(teamSlugSchema, req.query);
  res.json({
    data: await getSubscriptionForTeam(session, slug),
  });
};
