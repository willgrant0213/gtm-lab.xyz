import type { Account, Campaign, FitFactors, IntentSignal, Segment } from "./types";

export const STAGE_PROBABILITY: Record<string, number> = {
  Target: 5,
  Contacted: 10,
  Engaged: 20,
  Qualified: 35,
  Discovery: 50,
  Evaluation: 65,
  Negotiation: 80,
  "Closed Won": 100,
};

export function calculateFitScore(factors: FitFactors) {
  return Math.round(
    factors.industry * 0.25 +
    factors.size * 0.2 +
    factors.complexity * 0.25 +
    factors.geography * 0.1 +
    factors.technology * 0.2,
  );
}

export function calculateIntentScore(signals: IntentSignal[]) {
  return Math.min(100, signals.reduce((sum, signal) => sum + signal.points, 0));
}

export function dealValueScore(value: number) {
  return Math.min(100, Math.round((value / 250_000) * 100));
}

export function calculateOpportunityScore(account: Pick<Account, "fitScore" | "intentScore" | "engagement" | "dealValue" | "timing" | "buyerAccess">) {
  return Math.round(
    account.fitScore * 0.4 +
    account.intentScore * 0.25 +
    account.engagement * 0.15 +
    dealValueScore(account.dealValue) * 0.1 +
    account.timing * 0.05 +
    account.buyerAccess * 0.05,
  );
}

export function calculateMarketScore(segment: Pick<Segment, "fit" | "pain" | "opportunity" | "ease" | "competition">) {
  return Math.round(segment.fit * 0.3 + segment.pain * 0.25 + segment.opportunity * 0.25 + segment.ease * 0.2 - segment.competition * 0.1);
}

export function campaignMetrics(campaign: Campaign) {
  return {
    ctr: campaign.impressions ? (campaign.clicks / campaign.impressions) * 100 : 0,
    cpl: campaign.leads ? campaign.spend / campaign.leads : 0,
    cac: campaign.revenue ? campaign.spend / Math.max(1, Math.round(campaign.revenue / 165_000)) : 0,
    roas: campaign.spend ? campaign.revenue / campaign.spend : 0,
    efficiency: campaign.spend ? campaign.pipeline / campaign.spend : 0,
  };
}

export function planMetrics(accounts: Account[]) {
  const active = accounts.filter((account) => account.stage !== "Target");
  const pipeline = active.reduce((sum, account) => sum + account.dealValue, 0);
  const weighted = active.reduce((sum, account) => sum + account.dealValue * account.probability / 100, 0);
  const won = accounts.filter((account) => account.stage === "Closed Won");
  const qualified = accounts.filter((account) => account.fitScore >= 75).length;
  return {
    targetAccounts: accounts.length,
    qualified,
    pipeline,
    weighted,
    expectedRevenue: weighted * 0.86,
    averageDeal: active.length ? pipeline / active.length : 0,
    winRate: active.length ? (won.length / active.length) * 100 : 0,
    coverage: weighted ? pipeline / Math.max(weighted, 1) : 0,
  };
}
