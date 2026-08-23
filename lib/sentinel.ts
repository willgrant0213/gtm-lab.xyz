import { calculateFitScore, calculateIntentScore, calculateMarketScore, calculateOpportunityScore, STAGE_PROBABILITY } from "./scoring";
import type { Account, Campaign, FitFactors, GTMPlan, IntentSignal, Persona, Segment } from "./types";

type AccountSeed = {
  company: string;
  industry: string;
  revenue: string;
  employees: string;
  facilities: number;
  buyer: string;
  fit: [number, number, number, number, number];
  signals: [string, number][];
  engagement: number;
  dealValue: number;
  timing: number;
  access: number;
  stage: string;
  lastActivity: string;
  trigger: string;
};

const intentDates = ["Aug 19", "Aug 17", "Aug 15", "Aug 14", "Aug 12"];

function createAccount(seed: AccountSeed, index: number): Account {
  const fitFactors: FitFactors = {
    industry: seed.fit[0],
    size: seed.fit[1],
    complexity: seed.fit[2],
    geography: seed.fit[3],
    technology: seed.fit[4],
  };
  const intentSignals: IntentSignal[] = seed.signals.map(([label, points], signalIndex) => ({ label, points, date: intentDates[signalIndex] ?? "Aug 10" }));
  const fitScore = calculateFitScore(fitFactors);
  const intentScore = calculateIntentScore(intentSignals);
  const probability = STAGE_PROBABILITY[seed.stage] ?? 5;
  const base = {
    id: `sentinel-${index + 1}`,
    company: seed.company,
    industry: seed.industry,
    revenue: seed.revenue,
    employees: seed.employees,
    facilities: seed.facilities,
    buyer: seed.buyer,
    fitFactors,
    intentSignals,
    engagement: seed.engagement,
    dealValue: seed.dealValue,
    timing: seed.timing,
    buyerAccess: seed.access,
    fitScore,
    intentScore,
    stage: seed.stage,
    probability,
    lastActivity: seed.lastActivity,
    nextAction: `Reach out to the ${seed.buyer} referencing ${seed.trigger.toLowerCase()} and quantify the cost of unplanned downtime across ${seed.facilities} facilities.`,
    priorityReason: `${seed.industry} fit, ${seed.facilities}-facility operational footprint, and a recent ${seed.signals[0]?.[0].toLowerCase() ?? "buying"} signal create a credible near-term opening.`,
    outreachAngle: `Connect ${seed.trigger.toLowerCase()} to production continuity and the financial risk of avoidable equipment failure.`,
    painPoints: [
      "Unplanned equipment failures disrupt production schedules",
      "Maintenance teams rely on reactive or calendar-based work",
      "Operational data is fragmented across sites and systems",
    ],
    triggers: [seed.trigger, "Reliability initiative", "Rising maintenance costs"],
    buyerMap: {
      economicBuyer: "COO / VP Operations",
      champion: seed.buyer,
      technicalEvaluator: "Director of Manufacturing Systems",
      endUser: "Plant and maintenance teams",
      blocker: "IT security / plant finance",
    },
    timeline: [
      { date: "Aug 12", type: "sales" as const, event: `${seed.buyer} opened outbound email` },
      { date: "Aug 14", type: "marketing" as const, event: "Account visited predictive maintenance page" },
      { date: "Aug 15", type: "marketing" as const, event: "Reliability leader downloaded benchmark report" },
      { date: "Aug 17", type: "sales" as const, event: "LinkedIn connection accepted" },
      { date: "Aug 19", type: "opportunity" as const, event: seed.stage === "Target" ? "High-intent account flagged" : `${seed.stage} stage reached` },
    ],
    mainUseCase: "Detect equipment risk early enough to prevent costly unplanned production downtime.",
    followUp: "Send a one-page downtime business case within 24 hours, then invite the champion to a 20-minute asset-risk working session.",
  };
  return { ...base, opportunityScore: calculateOpportunityScore(base) };
}

const accountSeeds: AccountSeed[] = [
  { company: "Magna International", industry: "Automotive", revenue: "$40B+", employees: "170k+", facilities: 100, buyer: "VP Operations", fit: [98, 94, 98, 92, 88], signals: [["Announced facility expansion", 28], ["Downloaded benchmark report", 24], ["Visited product page", 18], ["Opened outbound email", 12]], engagement: 92, dealValue: 185000, timing: 95, access: 84, stage: "Discovery", lastActivity: "2h ago", trigger: "a new facility expansion" },
  { company: "Bosch", industry: "Industrial machinery", revenue: "$90B+", employees: "400k+", facilities: 130, buyer: "Reliability Director", fit: [96, 96, 99, 84, 92], signals: [["Attended reliability webinar", 25], ["Returned to website", 18], ["Engaged on LinkedIn", 14], ["Hiring reliability engineers", 22]], engagement: 86, dealValue: 220000, timing: 88, access: 76, stage: "Evaluation", lastActivity: "5h ago", trigger: "reliability team hiring" },
  { company: "Flex", industry: "Electronics", revenue: "$25B+", employees: "170k+", facilities: 90, buyer: "Director of Manufacturing", fit: [93, 92, 95, 90, 94], signals: [["Visited integrations page", 22], ["Downloaded ROI guide", 23], ["Opened outbound email", 12], ["Returned to website", 18]], engagement: 84, dealValue: 145000, timing: 86, access: 80, stage: "Qualified", lastActivity: "Yesterday", trigger: "a manufacturing systems modernization" },
  { company: "Jabil", industry: "Electronics", revenue: "$30B+", employees: "236k+", facilities: 100, buyer: "VP Operations", fit: [92, 95, 97, 90, 91], signals: [["Downloaded benchmark report", 24], ["Attended webinar", 25], ["Opened outbound email", 12]], engagement: 78, dealValue: 170000, timing: 82, access: 75, stage: "Qualified", lastActivity: "1d ago", trigger: "a multi-site efficiency program" },
  { company: "Lear", industry: "Automotive", revenue: "$23B+", employees: "186k+", facilities: 80, buyer: "Maintenance Director", fit: [97, 90, 93, 90, 82], signals: [["New facility announced", 28], ["Visited product page", 18], ["Engaged on LinkedIn", 14]], engagement: 76, dealValue: 132000, timing: 90, access: 72, stage: "Engaged", lastActivity: "2d ago", trigger: "a new production facility" },
  { company: "Aptiv", industry: "Automotive", revenue: "$20B+", employees: "200k+", facilities: 70, buyer: "COO", fit: [96, 90, 91, 88, 92], signals: [["Technology investment announced", 26], ["Visited ROI page", 20], ["Opened email", 11]], engagement: 73, dealValue: 155000, timing: 82, access: 66, stage: "Contacted", lastActivity: "3d ago", trigger: "an operations technology investment" },
  { company: "Honeywell Aerospace", industry: "Aerospace", revenue: "$15B+", employees: "95k+", facilities: 55, buyer: "VP Manufacturing", fit: [90, 88, 96, 92, 94], signals: [["Attended webinar", 25], ["Downloaded security brief", 18]], engagement: 70, dealValue: 195000, timing: 72, access: 65, stage: "Discovery", lastActivity: "4d ago", trigger: "a plant modernization initiative" },
  { company: "Tyson Foods", industry: "Food & beverage", revenue: "$50B+", employees: "139k+", facilities: 80, buyer: "Plant Operations Director", fit: [91, 92, 92, 94, 74], signals: [["Visited downtime page", 18], ["Downloaded food manufacturing guide", 24], ["Opened email", 11]], engagement: 68, dealValue: 118000, timing: 79, access: 68, stage: "Engaged", lastActivity: "4d ago", trigger: "a production resilience initiative" },
  { company: "General Mills", industry: "Food & beverage", revenue: "$20B+", employees: "35k+", facilities: 45, buyer: "VP Operations", fit: [90, 84, 88, 94, 78], signals: [["Attended webinar", 25], ["Returned to website", 18]], engagement: 64, dealValue: 125000, timing: 75, access: 60, stage: "Contacted", lastActivity: "5d ago", trigger: "a reliability program" },
  { company: "Parker Hannifin", industry: "Industrial machinery", revenue: "$19B+", employees: "62k+", facilities: 60, buyer: "Reliability Director", fit: [95, 87, 92, 94, 82], signals: [["Downloaded benchmark", 24], ["Product page visit", 18]], engagement: 62, dealValue: 138000, timing: 73, access: 64, stage: "Qualified", lastActivity: "6d ago", trigger: "a maintenance transformation program" },
  { company: "Emerson", industry: "Industrial machinery", revenue: "$17B+", employees: "74k+", facilities: 50, buyer: "Director of Operations", fit: [94, 86, 90, 92, 91], signals: [["Engaged with LinkedIn content", 14], ["Visited integrations page", 22]], engagement: 60, dealValue: 142000, timing: 68, access: 58, stage: "Engaged", lastActivity: "1w ago", trigger: "an industrial data initiative" },
  { company: "Collins Aerospace", industry: "Aerospace", revenue: "$26B+", employees: "80k+", facilities: 45, buyer: "Director of Manufacturing", fit: [89, 88, 94, 90, 90], signals: [["Downloaded report", 24], ["Visited security page", 16]], engagement: 59, dealValue: 176000, timing: 64, access: 55, stage: "Contacted", lastActivity: "1w ago", trigger: "a digital factory program" },
  { company: "Rockwell Automation", industry: "Industrial machinery", revenue: "$8B+", employees: "29k+", facilities: 35, buyer: "VP Operations", fit: [93, 80, 88, 92, 98], signals: [["Product page visit", 18], ["Opened outbound email", 12]], engagement: 55, dealValue: 110000, timing: 66, access: 58, stage: "Contacted", lastActivity: "1w ago", trigger: "a connected operations initiative" },
  { company: "Dana Incorporated", industry: "Automotive", revenue: "$10B+", employees: "40k+", facilities: 40, buyer: "Plant Manager", fit: [95, 82, 89, 92, 77], signals: [["New plant announced", 28], ["Visited product page", 18]], engagement: 58, dealValue: 98000, timing: 84, access: 54, stage: "Engaged", lastActivity: "8d ago", trigger: "a new plant ramp-up" },
  { company: "Caterpillar", industry: "Industrial machinery", revenue: "$67B+", employees: "113k+", facilities: 70, buyer: "Maintenance Director", fit: [96, 95, 96, 94, 84], signals: [["Downloaded ROI guide", 23]], engagement: 48, dealValue: 205000, timing: 58, access: 52, stage: "Target", lastActivity: "9d ago", trigger: "an enterprise maintenance review" },
  { company: "Boeing Commercial", industry: "Aerospace", revenue: "$70B+", employees: "170k+", facilities: 45, buyer: "VP Manufacturing", fit: [88, 96, 98, 94, 86], signals: [["Visited product page", 18], ["Hiring maintenance leaders", 22]], engagement: 50, dealValue: 245000, timing: 62, access: 40, stage: "Target", lastActivity: "10d ago", trigger: "manufacturing reliability hiring" },
  { company: "Kraft Heinz", industry: "Food & beverage", revenue: "$26B+", employees: "36k+", facilities: 35, buyer: "Director of Operations", fit: [90, 84, 86, 94, 72], signals: [["Downloaded guide", 22]], engagement: 42, dealValue: 102000, timing: 58, access: 48, stage: "Target", lastActivity: "11d ago", trigger: "a plant performance initiative" },
  { company: "Celestica", industry: "Electronics", revenue: "$9B+", employees: "27k+", facilities: 30, buyer: "Plant Manager", fit: [92, 78, 84, 88, 88], signals: [["Attended webinar", 25]], engagement: 46, dealValue: 88000, timing: 65, access: 52, stage: "Contacted", lastActivity: "12d ago", trigger: "a smart factory initiative" },
  { company: "Whirlpool", industry: "Electronics", revenue: "$19B+", employees: "59k+", facilities: 35, buyer: "Reliability Director", fit: [88, 85, 87, 94, 76], signals: [["Visited benchmark page", 17]], engagement: 40, dealValue: 115000, timing: 56, access: 45, stage: "Target", lastActivity: "13d ago", trigger: "an equipment modernization cycle" },
  { company: "3M", industry: "Industrial machinery", revenue: "$33B+", employees: "85k+", facilities: 60, buyer: "VP Operations", fit: [91, 90, 92, 94, 83], signals: [["Opened outbound email", 12]], engagement: 36, dealValue: 168000, timing: 50, access: 40, stage: "Target", lastActivity: "2w ago", trigger: "a manufacturing performance review" },
  { company: "GE Aerospace", industry: "Aerospace", revenue: "$35B+", employees: "52k+", facilities: 40, buyer: "Reliability Director", fit: [89, 86, 94, 92, 92], signals: [["Technology investment announced", 26]], engagement: 45, dealValue: 190000, timing: 68, access: 46, stage: "Target", lastActivity: "2w ago", trigger: "an AI operations investment" },
  { company: "Mondelez International", industry: "Food & beverage", revenue: "$36B+", employees: "91k+", facilities: 50, buyer: "Plant Operations Director", fit: [89, 89, 90, 90, 74], signals: [["Visited product page", 18]], engagement: 39, dealValue: 124000, timing: 55, access: 44, stage: "Target", lastActivity: "2w ago", trigger: "a production efficiency initiative" },
  { company: "TE Connectivity", industry: "Electronics", revenue: "$16B+", employees: "85k+", facilities: 50, buyer: "Director of Manufacturing", fit: [91, 86, 89, 90, 86], signals: [["Downloaded report", 24]], engagement: 44, dealValue: 134000, timing: 61, access: 49, stage: "Target", lastActivity: "16d ago", trigger: "a manufacturing analytics program" },
  { company: "Ball Corporation", industry: "Industrial machinery", revenue: "$14B+", employees: "21k+", facilities: 35, buyer: "Maintenance Director", fit: [88, 78, 86, 92, 70], signals: [["Opened email", 11]], engagement: 32, dealValue: 86000, timing: 48, access: 38, stage: "Target", lastActivity: "18d ago", trigger: "a maintenance cost review" },
  { company: "Stanley Black & Decker", industry: "Industrial machinery", revenue: "$15B+", employees: "50k+", facilities: 45, buyer: "VP Operations", fit: [90, 84, 88, 94, 75], signals: [["Visited downtime page", 18]], engagement: 38, dealValue: 112000, timing: 52, access: 42, stage: "Target", lastActivity: "20d ago", trigger: "an operational excellence initiative" },
];

export const sentinelAccounts = accountSeeds.map(createAccount).sort((a, b) => b.opportunityScore - a.opportunityScore);

const segmentInputs: Omit<Segment, "score">[] = [
  { name: "Automotive manufacturing", companies: 420, opportunity: 94, pain: 96, fit: 97, competition: 58, dealSize: 165000, salesCycle: 94, ease: 82, rationale: "High downtime cost, repeatable multi-site use cases, and accessible operations buyers." },
  { name: "Industrial machinery", companies: 610, opportunity: 91, pain: 91, fit: 94, competition: 52, dealSize: 148000, salesCycle: 102, ease: 80, rationale: "Strong operational fit and a broad account universe with mature maintenance teams." },
  { name: "Electronics manufacturing", companies: 380, opportunity: 84, pain: 86, fit: 90, competition: 62, dealSize: 132000, salesCycle: 88, ease: 76, rationale: "Fast production cycles amplify downtime risk, though existing analytics tools add competition." },
  { name: "Food & beverage", companies: 520, opportunity: 82, pain: 89, fit: 87, competition: 45, dealSize: 118000, salesCycle: 84, ease: 78, rationale: "Clear production continuity pain and lower competition, with somewhat smaller contract values." },
  { name: "Aerospace manufacturing", companies: 190, opportunity: 78, pain: 93, fit: 86, competition: 70, dealSize: 198000, salesCycle: 146, ease: 52, rationale: "Large deal potential, offset by long security reviews and complex procurement." },
];

export const sentinelSegments: Segment[] = segmentInputs.map((segment) => ({ ...segment, score: calculateMarketScore(segment) })).sort((a, b) => b.score - a.score);

export const sentinelPersonas: Persona[] = [
  { role: "COO / VP Operations", buyingRole: "Economic buyer", responsibilities: ["Network output", "Operating margin", "Capital allocation"], kpis: ["OEE", "Downtime cost", "On-time delivery"], pains: ["Production volatility", "Missed delivery commitments"], motivations: ["Protect margin", "Increase throughput without new capacity"], success: "Measurable downtime reduction across priority plants", objection: "Why now versus other operations investments?", angle: "Quantify the margin and delivery impact of preventable downtime.", influence: "High" },
  { role: "Reliability Director", buyingRole: "Champion", responsibilities: ["Asset reliability", "Maintenance strategy", "Plant standards"], kpis: ["MTBF", "Unplanned downtime", "Maintenance cost"], pains: ["Reactive work orders", "Poor failure visibility"], motivations: ["Prevent failures", "Standardize reliability practice"], success: "Earlier warnings that teams trust and act on", objection: "Will the model work with our equipment mix?", angle: "Start with critical assets and prove warning quality against known failures.", influence: "High" },
  { role: "Manufacturing Systems Director", buyingRole: "Technical evaluator", responsibilities: ["OT architecture", "Data integration", "Security"], kpis: ["Integration time", "System uptime", "Data quality"], pains: ["Fragmented plant data", "Complex integration burden"], motivations: ["Secure architecture", "Reusable data connections"], success: "A governed deployment that fits existing OT systems", objection: "This will create another data silo.", angle: "Position Sentinel as an intelligence layer across existing historians and sensors.", influence: "High" },
  { role: "Plant / Maintenance Manager", buyingRole: "End user", responsibilities: ["Daily output", "Maintenance execution", "Team scheduling"], kpis: ["Schedule attainment", "Emergency work", "Wrench time"], pains: ["False alarms", "Emergency callouts"], motivations: ["Clear priorities", "Fewer production surprises"], success: "Actionable alerts with enough lead time to plan work", objection: "My team cannot manage more alerts.", angle: "Focus on ranked, explainable risks tied to a recommended maintenance action.", influence: "Medium" },
];

export const sentinelCampaigns: Campaign[] = [
  { name: "Manufacturing Downtime Benchmark", channel: "Content", spend: 32000, impressions: 180000, clicks: 5400, leads: 620, mqls: 124, meetings: 31, opportunities: 12, pipeline: 1840000, revenue: 420000 },
  { name: "Predictive Maintenance Webinar", channel: "Webinar", spend: 18000, impressions: 68000, clicks: 3100, leads: 284, mqls: 88, meetings: 29, opportunities: 11, pipeline: 1620000, revenue: 510000 },
  { name: "Automotive Operations LinkedIn", channel: "Paid social", spend: 46000, impressions: 410000, clicks: 4100, leads: 510, mqls: 71, meetings: 18, opportunities: 8, pipeline: 1280000, revenue: 265000 },
  { name: "Plant Reliability Executive Dinner", channel: "Field event", spend: 28000, impressions: 9000, clicks: 340, leads: 42, mqls: 31, meetings: 18, opportunities: 9, pipeline: 1490000, revenue: 610000 },
  { name: "Industrial Operations Search", channel: "Paid search", spend: 52000, impressions: 220000, clicks: 8200, leads: 940, mqls: 96, meetings: 21, opportunities: 6, pipeline: 810000, revenue: 138000 },
];

export const sentinelPlan: GTMPlan = {
  id: "sentinel-demo",
  createdAt: "2026-08-23T12:00:00.000Z",
  isDemo: true,
  generationMode: "demo",
  strategyProfile: "industrial-operations",
  estimatedTam: 1_800_000_000,
  accountFields: { entityLabel: "Company", valueLabel: "Revenue", scaleLabel: "Facilities" },
  input: { company: "Sentinel AI", website: "sentinel-ai.example", product: "AI-powered predictive maintenance software", targetMarket: "Industrial manufacturers", geography: "United States", goal: "Acquire multi-site mid-market and enterprise customers" },
  summary: "Sentinel AI helps industrial manufacturers identify equipment risk before it becomes expensive unplanned downtime. The strongest entry point is multi-site manufacturers with mature reliability teams, expensive production interruptions, and usable equipment data.",
  valueProposition: "Help manufacturers reduce costly unplanned downtime by detecting equipment problems before failures occur.",
  positioning: "For multi-site industrial manufacturers that lose output and margin to unexpected equipment failures, Sentinel AI is a predictive maintenance platform that turns operational data into early, actionable risk warnings—without replacing existing plant systems.",
  segments: sentinelSegments,
  icp: {
    strong: ["Automotive or industrial manufacturing", "$1B–$50B revenue", "10+ production facilities", "Dedicated reliability leadership", "High downtime cost", "North American operations", "Usable sensor or historian data"],
    moderate: ["5–10 facilities", "$250M–$1B revenue", "Reactive maintenance culture", "Partial equipment connectivity", "Decentralized buying"],
    weak: ["Single-site operators", "Low-cost or non-critical equipment", "No operational data infrastructure", "Limited maintenance resources", "No executive owner for reliability"],
  },
  personas: sentinelPersonas,
  accounts: sentinelAccounts,
  campaigns: sentinelCampaigns,
  messaging: {
    painPoints: ["Unplanned downtime erodes margin and delivery performance", "Maintenance teams cannot see failures early enough to act", "Plant data exists, but does not consistently guide maintenance decisions", "Multi-site leaders lack a comparable view of equipment risk"],
    proofPoints: ["Illustrative: 12–18% reduction in unplanned downtime", "Illustrative: risk warnings 7–21 days before critical failure", "Illustrative: deployment to first critical asset group in six weeks"],
    coldEmail: "Hi {{first_name}} — when manufacturers add lines or ramp a new facility, maintenance teams often inherit more failure risk before they gain more visibility. Sentinel helps operations leaders identify which critical assets are likely to fail early enough to plan the work. Worth comparing that approach with how {{company}} currently protects production schedules?",
    linkedIn: "Noticed {{trigger}} at {{company}}. I work with manufacturing teams on identifying equipment risk before it disrupts production. Thought the connection could be useful as your operations footprint evolves.",
    callOpener: "I’m calling because multi-site operations teams often know downtime is expensive but cannot see which assets will put the next production schedule at risk. How are you currently prioritizing reliability work across plants?",
    elevatorPitch: "Sentinel helps multi-site manufacturers predict critical equipment failures before they interrupt production. It uses the operational data plants already collect to rank asset risk and give maintenance teams enough lead time to act.",
    discoveryQuestions: ["Which assets create the greatest production or delivery risk when they fail?", "How early can your team usually detect a developing equipment problem?", "How do reliability practices differ across facilities?", "What does one hour of unplanned downtime cost on a priority line?", "Which systems hold the equipment and maintenance data today?"],
    objections: [
      { objection: "We already have a condition-monitoring system.", response: "Sentinel can sit above existing monitoring and historians to prioritize cross-system risk. The question is whether your current setup gives teams enough warning and a clear action—not whether it produces more data." },
      { objection: "Our data is not ready.", response: "Start with one critical asset group and the signals already available. The pilot should test data sufficiency before any broad rollout commitment." },
      { objection: "Plant teams will not trust an AI alert.", response: "Make every warning explainable, connect it to known operating patterns, and validate it with reliability engineers before it becomes a work recommendation." },
    ],
  },
  recommendations: ["Concentrate outbound capacity on automotive suppliers and industrial machinery accounts scoring 80+.", "Lead with downtime economics for executive buyers and warning quality for reliability champions.", "Shift 15% of paid-search budget toward the executive dinner and webinar programs.", "Package a six-week critical-asset pilot to reduce technical and procurement friction.", "Create a plant-expansion trigger play for newly announced facilities."],
  insights: [
    { finding: "Automotive accounts represent 39% of qualified pipeline with 25% of campaign spend.", why: "The segment combines urgent downtime risk, multi-site expansion, and accessible operations buyers.", action: "Shift 15% of aerospace acquisition budget into automotive account programs and executive outreach.", impact: "High" },
    { finding: "Paid search produces the lowest CPL but the weakest pipeline efficiency.", why: "High lead volume is masking low qualification and poor opportunity conversion.", action: "Reduce broad keywords, add facility-count qualification, and move $12k toward webinar retargeting.", impact: "High" },
    { finding: "Reliability Directors create meetings 1.7× more often than general operations contacts.", why: "They feel the problem directly and can validate technical value before involving the economic buyer.", action: "Use reliability leaders as the initial champion, then multi-thread to VP Operations after discovery.", impact: "Medium" },
    { finding: "Pipeline coverage is below the 3× planning threshold in the current scenario.", why: "Late-stage concentration leaves the revenue plan vulnerable to two large deals slipping.", action: "Advance five high-fit engaged accounts into discovery and add $900k of qualified pipeline this month.", impact: "High" },
  ],
  nextExperiment: { title: "Test a trigger-led automotive account sprint.", description: "Select 20 high-fit accounts with recent facility or hiring signals. Run a two-persona sequence to Reliability Directors and VP Operations for 14 days, then compare meetings and qualified pipeline with the baseline outbound motion." },
};
