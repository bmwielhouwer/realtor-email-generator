import { getRedis } from "./redis";

/**
 * Per-customer subscription record, keyed by email under `subscription:{email}`.
 * Status mirrors Stripe's subscription status; only "active" grants access to
 * the generation tools. Kept in sync by the Stripe webhook (checkout.completed,
 * customer.subscription.updated, customer.subscription.deleted).
 */
export type SubscriptionRecord = {
  stripe_customer_id: string | null;
  subscription_id: string;
  status: string;
  created_at: string;
};

function subscriptionKey(email: string): string {
  return `subscription:${email.trim().toLowerCase()}`;
}

// Reverse index so webhook events (which carry the subscription id, not the
// email) can find the record to update.
function emailIndexKey(subscriptionId: string): string {
  return `subscription_email:${subscriptionId}`;
}

export async function storeSubscription(
  email: string,
  record: SubscriptionRecord,
): Promise<void> {
  const redis = getRedis();
  await redis.set(subscriptionKey(email), record);
  await redis.set(emailIndexKey(record.subscription_id), email.trim().toLowerCase());
}

export async function getSubscription(
  email: string,
): Promise<SubscriptionRecord | null> {
  const redis = getRedis();
  return (await redis.get<SubscriptionRecord>(subscriptionKey(email))) ?? null;
}

export async function isSubscriptionActive(email: string): Promise<boolean> {
  const record = await getSubscription(email);
  return record?.status === "active";
}

export async function emailForSubscription(
  subscriptionId: string,
): Promise<string | null> {
  const redis = getRedis();
  return (await redis.get<string>(emailIndexKey(subscriptionId))) ?? null;
}

/**
 * Update the status on an existing subscription record. Returns false if no
 * record exists for the email yet (the caller can then create one).
 */
export async function updateSubscriptionStatus(
  email: string,
  status: string,
): Promise<boolean> {
  const redis = getRedis();
  const record = await getSubscription(email);
  if (!record) return false;
  record.status = status;
  await redis.set(subscriptionKey(email), record);
  return true;
}
