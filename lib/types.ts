export type GTMInput = {
  company: string;
  website: string;
  product: string;
  targetMarket: string;
  geography: string;
  goal: string;
  notes?: string;
};

export type FitFactors = {
  industry: number;
  size: number;
  complexity: number;
  geography: number;
  technology: number;
};

export type IntentSignal = {
  label: string;
  points: number;
  date: string;
};

export type BuyerMap = {
  economicBuyer: string;
  champion: string;
  technicalEvaluator: string;
  endUser: string;
  blocker: string;
};

export type TimelineItem = {
  date: string;
  type: "marketing" | "sales" | "opportunity";
  event: string;
};

export type Account = {
  id: string;
  company: string;
  fictional?: boolean;
  industry: string;
  revenue: string;
  employees: string;
  facilities?: number;
  scaleLabel?: string;
  scaleValue?: string;
  buyer: string;
  fitFactors: FitFactors;
  intentSignals: IntentSignal[];
  engagement: number;
  dealValue: number;
  timing: number;
  buyerAccess: number;
  fitScore: number;
  intentScore: number;
  opportunityScore: number;
  stage: string;
  probability: number;
  lastActivity: string;
  nextAction: string;
  priorityReason: string;
  outreachAngle: string;
  painPoints: string[];
  triggers: string[];
  buyerMap: BuyerMap;
  timeline: TimelineItem[];
  mainUseCase?: string;
  followUp?: string;
};

export type Segment = {
  name: string;
  companies: number;
  opportunity: number;
  pain: number;
  fit: number;
  competition: number;
  dealSize: number;
  salesCycle: number;
  ease: number;
  score: number;
  rationale: string;
};

export type Persona = {
  role: string;
  buyingRole: string;
  responsibilities: string[];
  kpis: string[];
  pains: string[];
  motivations: string[];
  success: string;
  objection: string;
  angle: string;
  influence: "High" | "Medium";
};

export type Campaign = {
  name: string;
  channel: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  mqls: number;
  meetings: number;
  opportunities: number;
  pipeline: number;
  revenue: number;
};

export type Insight = {
  finding: string;
  why: string;
  action: string;
  impact: "High" | "Medium";
};

export type StrategyHypothesis = {
  summary: string;
  valueProposition: string;
  positioning: string;
  segments: { name: string; rationale: string }[];
  icp: { strong: string[]; moderate: string[]; weak: string[] };
  personas: Persona[];
  messaging: GTMPlan["messaging"];
  campaigns: { name: string; channel: string }[];
  recommendations: string[];
  insights: Insight[];
  marketIndustries: string[];
  buyingSignals: string[];
  accountPainPoints: string[];
  accountTriggers: string[];
  mainUseCase: string;
  followUp: string;
  nextExperiment: { title: string; description: string };
};

export type GTMPlan = {
  id: string;
  createdAt: string;
  isDemo: boolean;
  generationMode?: "demo" | "ai" | "illustrative";
  strategyProfile?: string;
  input: GTMInput;
  estimatedTam?: number;
  accountFields?: {
    entityLabel: string;
    valueLabel: string;
    scaleLabel: string;
  };
  summary: string;
  valueProposition: string;
  positioning: string;
  segments: Segment[];
  icp: {
    strong: string[];
    moderate: string[];
    weak: string[];
  };
  personas: Persona[];
  accounts: Account[];
  campaigns: Campaign[];
  messaging: {
    painPoints: string[];
    proofPoints: string[];
    coldEmail: string;
    linkedIn: string;
    callOpener: string;
    elevatorPitch: string;
    discoveryQuestions: string[];
    objections: { objection: string; response: string }[];
  };
  recommendations: string[];
  insights: Insight[];
  nextExperiment?: { title: string; description: string };
};
