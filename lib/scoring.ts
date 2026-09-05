export const DBM_FINANCE = { motorcycleCost: 600_000, gps: 40_000, registration: 20_000, insurance: 20_000, accessories: 20_000 } as const;
export const INVESTMENT_COST = 700_000;
export const PLANS = {
  fast: { label: 'FAST', months: 6, daily: 6_500, target: 1_000_000 },
  balance: { label: 'BALANCE', months: 8, daily: 5_500, target: 1_100_000 },
  flex: { label: 'FLEX', months: 10, daily: 4_500, target: 1_200_000 },
} as const;
export type PlanKey = keyof typeof PLANS;
export function calculatePreliminaryScore(input: { name:string; phone:string; address:string; residenceDuration:string; experienceMonths:number; licence:string; dailyRevenue:number; dailyFuel:number; dailyObligations:number; dailyOtherCost:number; plan:PlanKey; }) {
  const p=PLANS[input.plan]; const capacity=Math.max(0,input.dailyRevenue-input.dailyFuel-input.dailyObligations-input.dailyOtherCost); const ratio=p.daily?capacity/p.daily:0;
  let score=0; if(input.name.trim()&&input.phone.trim()&&input.address.trim())score+=20; if(Number(input.residenceDuration)>=1)score+=10;
  if(input.experienceMonths>=12)score+=20; else if(input.experienceMonths>=6)score+=12; else if(input.experienceMonths>=3)score+=6;
  if(input.licence==='yes')score+=15; if(input.dailyRevenue>0)score+=10; if(ratio>=1.3)score+=25; else if(ratio>=1)score+=15; else if(ratio>=0.8)score+=8;
  const status=score>=75?'PRE_QUALIFIED':score>=55?'TO_COMPLETE':'NOT_PRE_QUALIFIED';
  const target=p.target; const days=Math.ceil(target/p.daily); const finalPayment=target-(days-1)*p.daily; const grossMargin=target-INVESTMENT_COST;
  return {score,status,capacity,ratio,target,daily:p.daily,label:p.label,months:p.months,days,finalPayment,grossMargin,investmentCost:INVESTMENT_COST};
}
