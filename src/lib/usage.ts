import { RateLimiterPrisma } from 'rate-limiter-flexible';
import prisma from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

const FREE_CREDITS = 5;
const PREMIUM_CREDITS = 100;
const DURATION = 30 * 24 * 60 * 60; // 30 days
const USAGE_COST = 1;

export async function getUsageTracker() {
  const { has } = await auth();
  const hasPremium = has({
    plan: 'pro',
  });

  const usageTracker = new RateLimiterPrisma({
    storeClient: prisma,
    tableName: 'Usage',
    points: hasPremium ? PREMIUM_CREDITS : FREE_CREDITS,
    duration: DURATION,
  });

  return usageTracker;
}

export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authentificated');
  }

  const usageTracker = await getUsageTracker();
  const result = await usageTracker.consume(userId, USAGE_COST);
  return result;
}

export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authentificated');
  }
  const usageTracker = await getUsageTracker();
  const result = await usageTracker.get(userId);
  return result;
}
