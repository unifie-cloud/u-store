import Stripe from 'stripe';
import env from '@/lib/env';
import { updateTeam } from 'models/team';

let _stripe: Stripe | null = null;
export function getStripeClient() {
  if (!_stripe) {
    _stripe = new Stripe(env.stripe.secretKey ?? '');
  }
  return _stripe;
}

export async function getStripeCustomerId(teamMember, session?: any) {
  const stripe = getStripeClient();
  let customerId = '';
  if (!teamMember.team.billingId) {
    const customerData: {
      metadata: { teamId: string };
      email?: string;
    } = {
      metadata: {
        teamId: teamMember.teamId,
      },
    };
    if (session?.user?.email) {
      customerData.email = session?.user?.email;
    }
    const customer = await stripe.customers.create({
      ...customerData,
      name: session?.user?.name as string,
    });
    await updateTeam(teamMember.team.slug, {
      billingId: customer.id,
      billingProvider: 'stripe',
    });
    customerId = customer.id;
  } else {
    customerId = teamMember.team.billingId;
  }
  return customerId;
}
