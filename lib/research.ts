// Research priority is an editorial assessment, not buying intent or win probability.
export const RESEARCH_WEIGHTS = [35, 30, 20, 15] as const;
export const RESEARCH_CRITERIA = ["Category fit", "Published athlete activity", "Measurable use case", "Entry practicality"] as const;

export type ResearchSource = { id: string; title: string; publisher: string; url: string; date: string };
export type ResearchFactor = { value: number; reason: string };
export type ResearchAccount = {
  id: string;
  company: string;
  segment: string;
  sourceId: string;
  fact: string;
  buyer: string;
  factors: ResearchFactor[];
  hypothesis: string;
  angle: string;
  constraint: string;
  nextAction: string;
  question: string;
};

export function researchPriority(factors: ResearchFactor[]): number {
  if (factors.length !== RESEARCH_WEIGHTS.length || factors.some(({ value }) => !Number.isFinite(value) || value < 0 || value > 5)) {
    throw new Error("Research priority requires four factors between 0 and 5.");
  }
  return Math.round(factors.reduce((total, { value }, index) => total + value / 5 * RESEARCH_WEIGHTS[index], 0));
}

export function rankResearchAccounts(accounts: ResearchAccount[]) {
  return [...accounts].sort((a, b) => researchPriority(b.factors) - researchPriority(a.factors) || a.company.localeCompare(b.company));
}
