export const PLANS = {
  fast: { label: 'RAPIDE', target: 1_000_000, daily: 8_500 },
  balance: { label: 'ÉQUILIBRE', target: 1_100_000, daily: 6_500 },
  flex: { label: 'PROPRIÉTAIRE', target: 1_200_000, daily: 5_400 },
} as const;

export type PlanKey = keyof typeof PLANS;

export function calculatePreliminaryScore(input: {
  name: string; phone: string; address: string; residenceDuration: string;
  experienceMonths: number; licence: string; dailyRevenue: number;
  dailyFuel: number; dailyObligations: number; dailyOtherCost: number; plan: PlanKey;
}) {
  const p = PLANS[input.plan];
  const capacity = Math.max(0, input.dailyRevenue - input.dailyFuel - input.dailyObligations - input.dailyOtherCost);
  const ratio = p.daily ? capacity / p.daily : 0;
  let score = 0;
  if (input.name.trim() && input.phone.trim() && input.address.trim()) score += 20;
  if (Number(input.residenceDuration) >= 1) score += 10;
  if (input.experienceMonths >= 12) score += 20;
  else if (input.experienceMonths >= 6) score += 12;
  else if (input.experienceMonths >= 3) score += 6;
  if (input.licence === 'yes') score += 15;
  if (input.dailyRevenue > 0) score += 10;
  if (ratio >= 1.3) score += 25;
  else if (ratio >= 1) score += 15;
  else if (ratio >= 0.8) score += 8;
  const status = score >= 75 ? 'PRE_QUALIFIED' : score >= 55 ? 'TO_COMPLETE' : 'NOT_PRE_QUALIFIED';
  return { score, status, capacity, ratio, target: p.target, daily: p.daily, label: p.label };
}
