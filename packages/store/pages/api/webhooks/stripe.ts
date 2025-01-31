import Stripe from 'stripe';
import type { NextApiRequest, NextApiResponse } from 'next';
import env from '@/lib/env';
import type { Readable } from 'node:stream';
import {
  createStripeSubscription,
  deleteStripeSubscription,
  getBySubscriptionId,
  subscriptionModel_getByCustomerId,
  updateStripeSubscription,
} from 'models/subscription';
import { getByCustomerId } from 'models/team';
import { uStore_updateApplication } from 'apollo/resolvers/unifie/unifie';
import { iApplicationExtData } from 'types/unifieApi';
import { getStripeClient } from '@/lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Get raw body as string
async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks: any[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const relevantEvents: Stripe.Event.Type[] = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  const rawBody = await getRawBody(req);

  const sig = req.headers['stripe-signature'] as string;
  const { webhookSecret } = env.stripe;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) {
      return;
    }
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Error in /api/webhooks/stripe:`, err?.message || err);
    return res.status(400).json({ error: { message: err.message } });
  }

  const customer = (event.data.object as Stripe.Subscription).customer;
  const teamExists = await getByCustomerId(customer as string);
  if (!teamExists) {
    // Not accept events for non-existing teams
    console.error('Error: Webhook stripe:', `Team ${customer} does not exist`);
    throw new Error('Team does not exist');
  }

  if (relevantEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event);
          break;
        case 'customer.subscription.deleted':
          await deleteStripeSubscription(
            (event.data.object as Stripe.Subscription).id
          );
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }

      // Update subscriptions in unifie application extData
      // It will allow to have subscription data in the HELM chart and use it to generate the YAML
      await uStore_updateSubscriptions(teamExists.id, customer as string);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      console.error('Webhook handler failed:', error);
      return res.status(400).json({
        error: {
          message:
            error?.message ||
            'Webhook handler failed. View your nextjs function logs.',
          debug: error,
        },
      });
    }
  }
  return res.status(200).json({ received: true });
}

/**
 * Update subscriptions in unifie application extData
 * It will allow to have subscription data in the HELM chart and use it to generate the YAML
 * @param event
 * @returns
 */
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const {
    cancel_at,
    id,
    status,
    current_period_end,
    current_period_start,
    customer,
    items,
  } = event.data.object as Stripe.Subscription;

  const teamExists = await getByCustomerId(customer as string);
  if (!teamExists) {
    // Not accept events for non-existing teams
    console.error('Error: Webhook stripe:', `Team ${customer} does not exist`);
    throw new Error(`Team ${customer} does not exist`);
  }

  const subscription = await getBySubscriptionId(id);
  if (!subscription) {
    return await handleSubscriptionCreated(event);
  }

  const priceId = items.data.length > 0 ? items.data[0].plan?.id : '';
  //type Stripe.Subscription.Status = "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid"
  await updateStripeSubscription(id, {
    active: status === 'active',
    endDate: current_period_end
      ? new Date(current_period_end * 1000)
      : undefined,
    startDate: current_period_start
      ? new Date(current_period_start * 1000)
      : undefined,
    cancelAt: cancel_at ? new Date(cancel_at * 1000) : undefined,
    priceId,
  });
}

async function handleSubscriptionCreated(event: Stripe.Event) {
  const { customer, id, current_period_start, current_period_end, items } =
    event.data.object as Stripe.Subscription;

  await createStripeSubscription({
    customerId: customer as string,
    id,

    active: true,
    startDate: new Date(current_period_start * 1000),
    endDate: new Date(current_period_end * 1000),
    priceId: items.data.length > 0 ? items.data[0].plan?.id : '',
  });
}

/**
 * Update subscription in unifie application
 * @param teamId
 * @param subscription
 * @returns
 */
async function uStore_updateSubscriptions(
  teamId: string,
  customerId: string
): Promise<boolean> {
  const subscriptions = await subscriptionModel_getByCustomerId(customerId);
  const extData: iApplicationExtData = {
    teamId: teamId,
    subscriptions: subscriptions,
  };

  const res = await uStore_updateApplication(teamId, {
    extData: extData,
  });

  if (!res) {
    console.error(
      'Error: Webhook stripe:',
      'Error in uStore_updateApplication: empty response'
    );
    throw new Error(`Error in uStore_updateApplication: empty response`);
  }
  if (res?.error && res?.code !== `NotFound`) {
    console.error(
      'Error: Webhook stripe:',
      `Error in uStore_updateApplication:${res?.error}`
    );
    throw new Error(`Error in uStore_updateApplication:${res?.error}`);
  }
  return true;
}
