import { calculateFitScore, calculateIntentScore, calculateMarketScore, calculateOpportunityScore, planMetrics, STAGE_PROBABILITY } from "./scoring";
import type { Account, Campaign, GTMInput, GTMPlan, Insight, IntentSignal, Persona, Segment, StrategyHypothesis } from "./types";

export type InputErrors = Partial<Record<keyof GTMInput, string>>;
export type GenerationProgress = (step: number) => void;

type Profile = {
  id: string;
  accountFields: NonNullable<GTMPlan["accountFields"]>;
  industries: string[];
  segmentNames: (input: GTMInput) => string[];
  personas: Persona[];
  pains: string[];
  outcomes: string[];
  signals: [string, number][];
  triggers: string[];
  campaigns: { name: string; channel: string }[];
  scaleValues: string[];
  valueRanges: string[];
  dealRange: [number, number];
  salesCycle: [number, number];
  icp: StrategyHypothesis["icp"];
  mainUseCase: string;
  followUp: string;
};

function hash(value: string) {
  return value.split("").reduce((total, character) => ((total << 5) - total + character.charCodeAt(0)) | 0, 0);
}

function seeded(seed: number) {
  let value = Math.abs(seed) || 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function persona(role: string, buyingRole: string, responsibilities: string[], kpis: string[], pains: string[], motivations: string[], success: string, objection: string, angle: string, influence: "High" | "Medium" = "High"): Persona {
  return { role, buyingRole, responsibilities, kpis, pains, motivations, success, objection, angle, influence };
}

const industrialProfile: Profile = {
  id: "industrial-operations",
  accountFields: { entityLabel: "Company", valueLabel: "Revenue", scaleLabel: "Sites" },
  industries: ["Automotive suppliers", "Industrial equipment", "Food production", "Electronics production", "Specialty materials"],
  segmentNames: () => ["Multi-site discrete producers", "Process-intensive producers", "High-throughput contract producers", "Regulated production networks", "Regional mid-market operators"],
  personas: [
    persona("COO / VP Operations", "Economic buyer", ["Network output", "Operating margin", "Capital allocation"], ["Throughput", "Schedule attainment", "Operating cost"], ["Production interruptions", "Inconsistent performance across sites"], ["Protect margin", "Increase output without new capacity"], "A measurable operating improvement across priority sites", "Why should this take priority over other operating investments?", "Quantify the financial and delivery impact of avoidable disruption."),
    persona("Operations Excellence Director", "Champion", ["Improvement roadmap", "Cross-site standards", "Business case"], ["Yield", "Cycle time", "Adoption"], ["Reactive decision-making", "Limited cross-site visibility"], ["Standardize improvement", "Prove value quickly"], "A repeatable workflow that site teams adopt", "Will local teams actually use this?", "Start with one measurable workflow and make the recommendation operationally specific."),
    persona("Manufacturing Systems Director", "Technical evaluator", ["Data architecture", "Integration", "Security"], ["Integration time", "System uptime", "Data quality"], ["Fragmented operating data", "Integration burden"], ["Secure deployment", "Reusable connections"], "A governed deployment that fits the current stack", "This could create another data silo.", "Show how the product works with the systems already in place."),
    persona("Site Operations Manager", "End user", ["Daily output", "Team priorities", "Escalation"], ["Schedule adherence", "Rework", "Response time"], ["Too many disconnected alerts", "Last-minute schedule changes"], ["Clear priorities", "Fewer surprises"], "Specific actions with enough lead time to respond", "My team cannot manage another dashboard.", "Lead with fewer, ranked actions rather than more data.", "Medium"),
  ],
  pains: ["Operating problems are detected after schedules are already at risk", "Teams lack a consistent view of priority issues across sites", "Existing data does not translate into clear next actions", "Leaders struggle to connect operational decisions to financial impact"],
  outcomes: ["identify operating risk earlier", "protect throughput and delivery performance", "standardize decisions across sites"],
  signals: [["Downloaded operations benchmark", 24], ["Attended operations webinar", 25], ["Visited use-case page", 18], ["Returned to ROI page", 18], ["Announced site expansion", 28], ["Hiring operations analysts", 22]],
  triggers: ["Site expansion", "Operations transformation", "New production program", "Data platform investment"],
  campaigns: [{ name: "Operations Performance Benchmark", channel: "Content" }, { name: "Operational Risk Workshop", channel: "Webinar" }, { name: "Operations Leader Program", channel: "Paid social" }, { name: "Executive Operations Roundtable", channel: "Field event" }, { name: "High-intent Operations Search", channel: "Paid search" }],
  scaleValues: ["3–5", "6–10", "11–20", "21–40", "40+"], valueRanges: ["$50M–$100M", "$100M–$250M", "$250M–$500M", "$500M–$1B", "$1B+"], dealRange: [65000, 220000], salesCycle: [70, 150],
  icp: { strong: ["Multiple operating sites", "$250M+ revenue", "High cost of operational disruption", "Dedicated operations improvement owner", "Usable operational data", "Executive mandate for measurable change"], moderate: ["Two to five sites", "$50M–$250M revenue", "Partial data coverage", "Decentralized decision-making", "Improvement need without a funded initiative"], weak: ["Single small site", "Low cost of disruption", "No accountable executive owner", "No accessible operating data", "Little capacity to change current processes"] },
  mainUseCase: "Surface operational risk early enough for teams to protect output and delivery commitments.", followUp: "Send a one-page operating-impact hypothesis, then propose a 20-minute workflow review with the champion.",
};

const saasProfile: Profile = {
  id: "b2b-saas-revenue",
  accountFields: { entityLabel: "Company", valueLabel: "ARR band", scaleLabel: "GTM team" },
  industries: ["B2B SaaS", "Vertical software", "Developer tools", "Fintech software", "Data platforms"],
  segmentNames: () => ["High-growth B2B SaaS", "Enterprise subscription software", "Usage-based software businesses", "PE-backed SaaS portfolios", "Vertical SaaS scale-ups"],
  personas: [
    persona("CFO", "Economic buyer", ["Forecast confidence", "Board planning", "Capital allocation"], ["Forecast variance", "Cash efficiency", "Net retention"], ["Unreliable revenue calls", "Late visibility into risk"], ["Reduce surprises", "Plan hiring and spend confidently"], "An auditable forecast the board can trust", "We already forecast in our planning system.", "Lead with forecast confidence and the cost of late revenue surprises."),
    persona("VP Revenue Operations", "Champion", ["Forecast process", "Pipeline governance", "Data definitions"], ["Forecast accuracy", "Coverage", "Stage conversion"], ["Rep-driven rollups", "Inconsistent stage hygiene"], ["Create one revenue view", "Improve operating cadence"], "A faster weekly forecast with explainable changes", "Our CRM data is not clean enough.", "Show how the product identifies risk while exposing the data gaps that matter."),
    persona("Head of Data / Business Systems", "Technical evaluator", ["Data quality", "Integrations", "Governance"], ["Sync reliability", "Time to deploy", "Data completeness"], ["Conflicting source systems", "Fragile reporting logic"], ["Governed metrics", "Low-maintenance architecture"], "Trusted definitions across CRM, billing, and product data", "This will duplicate our warehouse models.", "Position the product as a decision layer with transparent source lineage."),
    persona("Sales Director", "End user", ["Team commit", "Deal inspection", "Coaching"], ["Quota attainment", "Slippage", "Win rate"], ["Manual forecast updates", "Hidden deal risk"], ["Focus manager time", "Coach the right deals"], "A clear weekly view of deals requiring action", "I do not want another admin workflow.", "Emphasize automated risk signals and concrete manager actions.", "Medium"),
  ],
  pains: ["Forecast calls depend on subjective rep judgment", "Revenue risk becomes visible too late to correct", "CRM, billing, and product signals are disconnected", "Managers spend time collecting updates instead of improving deals"],
  outcomes: ["produce an explainable revenue forecast", "surface pipeline risk earlier", "focus managers on the deals that need action"],
  signals: [["Downloaded forecasting benchmark", 24], ["Attended RevOps webinar", 25], ["Visited integrations page", 22], ["Returned to forecast page", 18], ["Hiring revenue operations", 22], ["Announced new CRO", 28]],
  triggers: ["New revenue leader", "Board planning cycle", "CRM migration", "Missed forecast", "Move upmarket"],
  campaigns: [{ name: "Revenue Forecast Accuracy Benchmark", channel: "Content" }, { name: "Modern Forecasting Workshop", channel: "Webinar" }, { name: "RevOps Leader LinkedIn Program", channel: "Paid social" }, { name: "CFO & CRO Planning Dinner", channel: "Field event" }, { name: "Revenue Forecasting Search", channel: "Paid search" }],
  scaleValues: ["15–30 people", "31–75 people", "76–150 people", "151–300 people", "300+ people"], valueRanges: ["$10M–$25M", "$25M–$50M", "$50M–$100M", "$100M–$250M", "$250M+"], dealRange: [28000, 145000], salesCycle: [35, 105],
  icp: { strong: ["B2B recurring-revenue model", "$25M–$250M ARR", "50+ person GTM team", "Dedicated revenue operations function", "CRM plus billing or product-usage data", "Executive pressure to improve forecast confidence"], moderate: ["$10M–$25M ARR", "Small RevOps team", "Mostly CRM-based forecasting", "Inconsistent stage governance", "Growing planning complexity"], weak: ["Pre-revenue company", "Founder-managed pipeline", "Fewer than ten sellers", "No consistent CRM process", "Transactional model without recurring forecasts"] },
  mainUseCase: "Create an explainable forecast and surface pipeline risk before the weekly revenue call.", followUp: "Share a forecast-variance checklist, then invite RevOps to compare one quarter of commit history with the model.",
};

const localProfile: Profile = {
  id: "local-services",
  accountFields: { entityLabel: "Business", valueLabel: "Annual sales", scaleLabel: "Locations" },
  industries: ["Home services", "Health & wellness", "Professional services", "Hospitality", "Education services"],
  segmentNames: () => ["Multi-location service operators", "Premium appointment businesses", "High-frequency neighborhood services", "Franchise and franchise-ready brands", "Independent growth-stage operators"],
  personas: [
    persona("Owner / General Manager", "Economic buyer", ["Revenue", "Staffing", "Service quality"], ["Booked revenue", "Utilization", "Repeat business"], ["Unpredictable demand", "Thin operating margins"], ["Fill capacity profitably", "Build a durable local brand"], "More profitable bookings without operational overload", "We have tried marketing tools before.", "Tie the plan to booked revenue, capacity, and repeat customers."),
    persona("Growth / Marketing Manager", "Champion", ["Local acquisition", "Promotions", "Customer lifecycle"], ["Cost per booking", "Conversion rate", "Repeat rate"], ["Weak lead quality", "Disconnected campaign reporting"], ["Improve booking conversion", "Prove channel value"], "A clear view from campaign spend to completed booking", "Lead volume is not our problem.", "Focus on qualified demand and repeat value, not raw leads."),
    persona("Operations Manager", "Technical evaluator", ["Scheduling", "Service capacity", "Workflow"], ["Utilization", "Cancellation rate", "Response time"], ["Demand spikes", "Manual handoffs"], ["Protect service quality", "Match demand to capacity"], "A workflow that fits scheduling and frontline routines", "This could create more work for staff.", "Show how the experience reduces manual follow-up and scheduling friction."),
    persona("Location Manager", "End user", ["Daily schedule", "Team coordination", "Customer recovery"], ["Completed bookings", "Reviews", "Rebooking"], ["No-shows", "Inconsistent follow-up"], ["Keep schedules full", "Deliver a consistent experience"], "Clear daily priorities and fewer missed bookings", "My team will not use another complex system.", "Lead with a simple next-best-action workflow.", "Medium"),
  ],
  pains: ["Demand is inconsistent across days and locations", "Low-quality inquiries consume staff time without becoming bookings", "Customer follow-up is manual and uneven", "Marketing spend is disconnected from completed service revenue"],
  outcomes: ["turn nearby demand into profitable bookings", "fill unused capacity", "increase repeat visits and referrals"],
  signals: [["Requested a local growth guide", 24], ["Attended booking workshop", 25], ["Visited pricing page", 18], ["Returned to case study", 18], ["Opened a new location", 28], ["Hiring customer coordinators", 22]],
  triggers: ["New location", "Seasonal demand shift", "New service launch", "Booking platform change", "Expansion into a nearby market"],
  campaigns: [{ name: "Local Demand Benchmark", channel: "Content" }, { name: "Booking Growth Workshop", channel: "Webinar" }, { name: "Neighborhood Awareness Program", channel: "Paid social" }, { name: "Local Owner Roundtable", channel: "Community event" }, { name: "High-intent Local Search", channel: "Paid search" }],
  scaleValues: ["1 location", "2–3 locations", "4–6 locations", "7–12 locations", "12+ locations"], valueRanges: ["$500k–$1M", "$1M–$3M", "$3M–$7M", "$7M–$15M", "$15M+"], dealRange: [6000, 38000], salesCycle: [12, 55],
  icp: { strong: ["Two or more service locations", "Measurable unused capacity", "Online booking or lead capture", "Owner willing to track completed revenue", "Strong local review base", "Repeat-service potential"], moderate: ["Single growing location", "Manual scheduling", "Seasonal demand", "Limited marketing ownership", "Inconsistent follow-up"], weak: ["No capacity for additional bookings", "One-time emergency-only service", "No digital lead capture", "No owner for customer follow-up", "Unable to track completed work"] },
  mainUseCase: "Convert nearby demand into profitable bookings while matching acquisition to available service capacity.", followUp: "Send a local demand-to-booking scorecard, then schedule a 20-minute capacity and conversion review.",
};

const consumerProfile: Profile = {
  id: "consumer-subscription",
  accountFields: { entityLabel: "Audience cohort", valueLabel: "Annual value", scaleLabel: "Addressable members" },
  industries: ["Urban professionals", "Active households", "Value seekers", "Enthusiast communities", "Lapsed category buyers"],
  segmentNames: () => ["High-intent category switchers", "Habit-driven power users", "Convenience-first professionals", "Value-conscious households", "Enthusiast referral communities"],
  personas: [
    persona("VP Growth", "Economic buyer", ["Acquisition strategy", "Budget allocation", "Growth model"], ["CAC payback", "LTV:CAC", "Net adds"], ["Rising acquisition cost", "Weak payback visibility"], ["Scale efficient growth", "Improve cohort quality"], "More durable subscriber growth with controlled payback", "We can buy cheaper volume elsewhere.", "Compare channels on retained customer value, not signup cost."),
    persona("Lifecycle Marketing Lead", "Champion", ["Activation", "Retention", "Lifecycle journeys"], ["Activation rate", "Month-three retention", "Reactivation"], ["Early churn", "Generic onboarding"], ["Build habit earlier", "Recover at-risk members"], "A measurable lift in activation and early retention", "We already have lifecycle automation.", "Focus on which behavior to change and when, not another sending tool."),
    persona("Product Analytics Lead", "Technical evaluator", ["Experiment design", "Event quality", "Cohort analysis"], ["Experiment velocity", "Data coverage", "Incremental lift"], ["Fragmented events", "Unclear causality"], ["Reliable measurement", "Faster learning"], "A trusted view of cohort behavior and experiment impact", "Attribution will still be uncertain.", "Use holdouts and explicit assumptions to separate signal from correlation."),
    persona("Customer Experience Lead", "End user", ["Member support", "Feedback loops", "Service recovery"], ["Resolution time", "CSAT", "Save rate"], ["Repeated friction", "Late churn signals"], ["Resolve issues earlier", "Keep valuable members"], "Prioritized interventions for customers at risk", "This could make the experience feel intrusive.", "Use behavior to improve relevance while preserving customer control.", "Medium"),
  ],
  pains: ["Acquisition volume does not translate into durable subscribers", "Early customer behavior is a weak predictor in current reporting", "Lifecycle messages are broad rather than behavior-specific", "Teams optimize signup cost without seeing retained value"],
  outcomes: ["acquire higher-retention customers", "build repeat behavior earlier", "allocate growth spend by retained value"],
  signals: [["Joined waitlist", 24], ["Completed product quiz", 25], ["Visited plan comparison", 22], ["Returned to checkout", 18], ["Engaged with creator review", 14], ["Started trial", 28]],
  triggers: ["Trial start", "Category research", "Price comparison", "Referral activity", "Cart return"],
  campaigns: [{ name: "Category Value Guide", channel: "Content" }, { name: "Member Experience Preview", channel: "Virtual event" }, { name: "Creator Proof Program", channel: "Paid social" }, { name: "Community Referral Sprint", channel: "Referral" }, { name: "High-intent Category Search", channel: "Paid search" }],
  scaleValues: ["8k–15k", "15k–30k", "30k–60k", "60k–120k", "120k+"], valueRanges: ["$250k–$500k", "$500k–$1M", "$1M–$2M", "$2M–$5M", "$5M+"], dealRange: [8000, 52000], salesCycle: [7, 35],
  icp: { strong: ["Clear recurring customer need", "High-intent digital behavior", "Strong first-month habit potential", "Healthy contribution margin", "Measurable activation event", "Referral or community effects"], moderate: ["Seasonal category demand", "Price-sensitive audience", "Longer path to habit", "Limited first-party behavior", "Moderate repeat frequency"], weak: ["One-time purchase intent", "Very low category involvement", "No clear activation event", "High fulfillment cost", "Acquisition dependent on deep discounting"] },
  mainUseCase: "Acquire and activate customer cohorts that are likely to retain beyond the introductory period.", followUp: "Review the first-30-day behavior model, then test one cohort-specific activation journey with a holdout group.",
};

const generalProfile: Profile = {
  id: "general-b2b",
  accountFields: { entityLabel: "Company", valueLabel: "Revenue", scaleLabel: "Relevant team" },
  industries: ["Technology services", "Professional services", "Business services", "Digital commerce", "Growth-stage companies"],
  segmentNames: (input) => [input.targetMarket, "Complex multi-team buyers", "Fast-growth mid-market organizations", "Regulated enterprise buyers", "Specialist regional operators"],
  personas: [
    persona("Business Unit Executive", "Economic buyer", ["Business performance", "Budget", "Strategic priorities"], ["Revenue", "Margin", "Time to value"], ["Slow execution", "Unclear return on current process"], ["Improve a measurable outcome", "Reduce execution risk"], "A clear business result within the planning horizon", "Why is this more urgent than our other priorities?", "Tie the decision to one quantified business outcome."),
    persona("Functional Director", "Champion", ["Process ownership", "Team performance", "Adoption"], ["Cycle time", "Quality", "Adoption"], ["Manual coordination", "Limited visibility"], ["Make the team more effective", "Create a repeatable process"], "A workflow the team adopts and can measure", "Changing the process will be disruptive.", "Start with a narrow workflow and a visible before-and-after measure."),
    persona("Systems / Data Lead", "Technical evaluator", ["Architecture", "Security", "Data quality"], ["Deployment time", "Reliability", "Governance"], ["Integration burden", "Fragmented systems"], ["Fit the current stack", "Avoid long-term maintenance"], "A secure deployment with clear ownership", "This adds another system to maintain.", "Be explicit about integration scope, data movement, and ownership."),
    persona("Team Manager", "End user", ["Daily execution", "Prioritization", "Coaching"], ["Throughput", "Response time", "Quality"], ["Too much manual work", "Unclear priorities"], ["Save time", "Make better day-to-day decisions"], "Fewer manual steps and clearer actions", "My team will not use a complicated tool.", "Show the exact action the product makes easier.", "Medium"),
  ],
  pains: ["The current workflow is manual and inconsistent", "Leaders lack timely visibility into performance", "Teams lose time coordinating work across tools", "Decision-makers cannot clearly connect activity to business results"],
  outcomes: ["make the core workflow faster and more consistent", "give leaders earlier performance visibility", "connect team action to a measurable business result"],
  signals: [["Downloaded buyer guide", 24], ["Attended industry webinar", 25], ["Visited product page", 18], ["Returned to website", 18], ["Hiring relevant team", 22], ["Announced expansion", 28]],
  triggers: ["New executive owner", "Growth initiative", "System change", "Expansion", "Budget planning"],
  campaigns: [{ name: "Market Performance Benchmark", channel: "Content" }, { name: "Buyer Workflow Workshop", channel: "Webinar" }, { name: "Target Buyer LinkedIn Program", channel: "Paid social" }, { name: "Executive Peer Roundtable", channel: "Field event" }, { name: "High-intent Solution Search", channel: "Paid search" }],
  scaleValues: ["10–25 people", "26–50 people", "51–100 people", "101–250 people", "250+ people"], valueRanges: ["$10M–$25M", "$25M–$50M", "$50M–$100M", "$100M–$250M", "$250M+"], dealRange: [20000, 115000], salesCycle: [30, 100],
  icp: { strong: ["Clear owner for the problem", "Measurable cost of the current workflow", "Enough scale for repeatable value", "Existing budget or funded initiative", "Accessible operating data", "Executive support for change"], moderate: ["Recognized problem without urgency", "Smaller team", "Partially defined process", "Limited data", "Decentralized buying"], weak: ["No accountable buyer", "Low cost of the current approach", "No capacity to implement", "Unclear success measure", "One-off rather than repeatable need"] },
  mainUseCase: "Replace a costly, inconsistent workflow with a repeatable path to a measurable business result.", followUp: "Send a one-page business-case hypothesis, then propose a 20-minute workflow and success-metric review.",
};

function resolveProfile(input: GTMInput): Profile {
  const context = `${input.product} ${input.targetMarket} ${input.notes ?? ""}`.toLowerCase();
  if (/manufactur|industrial|equipment|factory|plant|predictive maintenance|machine/.test(context)) return industrialProfile;
  if (/saas|software compan|revops|revenue forecast|sales forecast|crm|subscription software/.test(context)) return saasProfile;
  if (/local service|home service|salon|clinic|restaurant|appointment|booking|franchise|contractor|plumb|dental/.test(context)) return localProfile;
  if (/consumer|subscription|member|direct.to.consumer|d2c|fitness app|meal|beauty|fashion|apparel|footwear|shopper/.test(context)) return consumerProfile;
  return generalProfile;
}

function outcomeSentence(input: GTMInput, profile: Profile) {
  return profile.outcomes[Math.abs(hash(input.product)) % profile.outcomes.length];
}

export function createIllustrativeStrategy(input: GTMInput): StrategyHypothesis {
  const profile = resolveProfile(input);
  const outcome = outcomeSentence(input, profile);
  const market = input.targetMarket.trim();
  const product = input.product.trim();
  const company = input.company.trim();
  const segments = profile.segmentNames(input).map((name, index) => ({ name, rationale: [`Closest match to the stated market, with a visible need to ${outcome}.`, `Larger buying groups and higher contract potential, balanced by more stakeholders and a longer decision cycle.`, `Growth pressure creates urgency, although process maturity varies across accounts.`, `Compliance and governance increase the value of a structured approach while slowing entry.`, `A focused, reachable segment that can support fast learning before broader expansion.`][index] }));
  const topPersona = profile.personas[1];
  const pain = profile.pains[0].toLowerCase();
  return {
    summary: `${company} offers ${product} for ${market} in ${input.geography}. The recommended entry point is ${segments[0].name.toLowerCase()}, where the need is clearest and the path to ${input.goal.toLowerCase()} is easiest to test.`,
    valueProposition: `${company} helps ${market} ${outcome} through ${product.toLowerCase()}.`,
    positioning: `For ${market} that struggle because ${pain}, ${company} provides ${product.toLowerCase()} to ${outcome}, with a focused path from initial use case to measurable adoption.`,
    segments, icp: profile.icp, personas: profile.personas,
    messaging: {
      painPoints: profile.pains,
      proofPoints: ["Illustrative hypothesis: first measurable value within 30–90 days", "Illustrative hypothesis: 10–20% improvement in the primary workflow metric", "Illustrative hypothesis: one focused use case before broader rollout"],
      coldEmail: `Hi {{first_name}} — ${profile.pains[0]} often makes ${input.goal.toLowerCase()} harder than it should be. ${company} helps ${market} ${outcome} through ${product.toLowerCase()}. Is that a priority your team is actively working on this quarter?`,
      linkedIn: `Noticed {{trigger}} at {{company}}. I work with ${market.toLowerCase()} teams on how to ${outcome}. Thought the connection could be timely.`,
      callOpener: `I’m calling because ${market.toLowerCase()} teams often tell us ${pain}. How is your team handling that today?`,
      elevatorPitch: `${company} helps ${market} ${outcome}. ${product} gives teams a practical way to move from the current pain to a measurable result without starting with a broad transformation.`,
      discoveryQuestions: [`How is your team handling the fact that ${pain} today?`, "Which metric would prove this problem is worth solving now?", "Who owns the current process and who feels the impact most directly?", "What has prevented the team from improving this before?", "What would a credible first result need to look like within 90 days?"],
      objections: [{ objection: "This is not a priority right now.", response: `Anchor the discussion in the cost of the current problem and agree on the condition that would make action timely.` }, { objection: "We already have a process or tool for this.", response: "Compare the current workflow against one measurable gap. Do not argue for replacement if the existing approach already delivers the required result." }, { objection: "Implementation will take too much effort.", response: "Define the smallest useful use case, the minimum data required, and a time-boxed success measure before discussing broader rollout." }],
    },
    campaigns: profile.campaigns,
    recommendations: [`Concentrate initial sales effort on ${segments[0].name}.`, "Prioritize prospects with ICP fit above 75 and at least two relevant buying signals.", `Lead outreach to the ${topPersona.role} with this angle: ${topPersona.angle}`, `Package the first sale around this use case: ${profile.mainUseCase}`, "Reallocate campaign budget by qualified pipeline efficiency, not lead volume."],
    insights: [], marketIndustries: profile.industries, buyingSignals: profile.signals.map(([label]) => label), accountPainPoints: profile.pains.slice(0, 3), accountTriggers: profile.triggers, mainUseCase: profile.mainUseCase, followUp: profile.followUp,
    nextExperiment: { title: `Test a trigger-led ${segments[0].name.toLowerCase()} sprint.`, description: `Select 20 high-fit prospects with a recent ${profile.triggers[0].toLowerCase()} or ${profile.triggers[1].toLowerCase()} signal. Run a two-persona sequence to the ${profile.personas[1].role} and ${profile.personas[0].role} for 14 days, then compare meetings and qualified pipeline with the baseline motion.` },
  };
}

const fictionalRoots = ["Alder", "Bramble", "Cobalt", "Driftwood", "Elmspire", "Fable", "Grove", "Halcyon", "Ivory", "Juniper", "Kestrel", "Lumen", "Morrow", "Northvale", "Oakline", "Praxis", "Quarry", "Redwood", "Solace", "Tandem", "Umber", "Vela", "Willow", "Yellowfin", "Zephyr"];
const fictionalSuffixes = ["& Co.", "Works", "Collective", "Partners", "Network", "Group", "Studio", "Labs", "House", "Company"];

function generatedAccount(input: GTMInput, strategy: StrategyHypothesis, profile: Profile, index: number, random: () => number): Account {
  const fitFactors = { industry: 62 + Math.round(random() * 36), size: 54 + Math.round(random() * 43), complexity: 58 + Math.round(random() * 40), geography: 74 + Math.round(random() * 24), technology: 52 + Math.round(random() * 45) };
  const signalCount = 1 + Math.floor(random() * 4);
  const intentSignals: IntentSignal[] = Array.from({ length: signalCount }, (_, signalIndex) => { const signal = profile.signals[(index * 2 + signalIndex) % profile.signals.length]; return { label: signal[0], points: signal[1], date: `Aug ${19 - signalIndex * 2}` }; });
  const fitScore = calculateFitScore(fitFactors);
  const intentScore = calculateIntentScore(intentSignals);
  const stageOptions = ["Target", "Target", "Contacted", "Engaged", "Qualified", "Discovery", "Evaluation"];
  const stage = stageOptions[Math.floor(random() * stageOptions.length)];
  const dealValue = profile.dealRange[0] + Math.round(random() * (profile.dealRange[1] - profile.dealRange[0]));
  const engagement = 32 + Math.round(random() * 65), timing = 40 + Math.round(random() * 57), buyerAccess = 32 + Math.round(random() * 63);
  const buyer = strategy.personas[index % strategy.personas.length].role;
  const trigger = strategy.accountTriggers[index % strategy.accountTriggers.length];
  const segment = strategy.segments[index % strategy.segments.length];
  const base = {
    id: `generated-${Math.abs(hash(JSON.stringify(input)))}-${index + 1}`, company: `${fictionalRoots[index % fictionalRoots.length]} ${fictionalSuffixes[(index + Math.abs(hash(input.company))) % fictionalSuffixes.length]}`, fictional: true,
    industry: strategy.marketIndustries[index % strategy.marketIndustries.length], revenue: profile.valueRanges[index % profile.valueRanges.length], employees: profile.scaleValues[index % profile.scaleValues.length], scaleLabel: profile.accountFields.scaleLabel, scaleValue: profile.scaleValues[index % profile.scaleValues.length], buyer,
    fitFactors, intentSignals, engagement, dealValue, timing, buyerAccess, fitScore, intentScore, stage, probability: STAGE_PROBABILITY[stage], lastActivity: index < 4 ? `${index + 1}h ago` : `${index - 2}d ago`,
    nextAction: `Contact the ${buyer} about ${trigger.toLowerCase()} and test whether ${strategy.accountPainPoints[0].toLowerCase()} is creating an active business priority.`,
    priorityReason: `${segment.name} alignment, ${signalCount} illustrative buying signal${signalCount === 1 ? "" : "s"}, and credible near-term value potential.`,
    outreachAngle: `Connect ${trigger.toLowerCase()} to ${strategy.valueProposition.replace(`${input.company} `, "").replace(/\.$/, "").toLowerCase()}.`,
    painPoints: strategy.accountPainPoints, triggers: [trigger, intentSignals[0].label, strategy.accountTriggers[(index + 1) % strategy.accountTriggers.length]],
    buyerMap: { economicBuyer: strategy.personas.find((item) => item.buyingRole === "Economic buyer")?.role ?? strategy.personas[0].role, champion: strategy.personas.find((item) => item.buyingRole === "Champion")?.role ?? strategy.personas[1].role, technicalEvaluator: strategy.personas.find((item) => item.buyingRole === "Technical evaluator")?.role ?? strategy.personas[2].role, endUser: strategy.personas.find((item) => item.buyingRole === "End user")?.role ?? strategy.personas[3].role, blocker: "Finance / procurement" },
    timeline: [{ date: "Aug 12", type: "marketing" as const, event: intentSignals[0].label }, { date: "Aug 15", type: "sales" as const, event: `${buyer} opened a targeted outreach message` }, { date: "Aug 19", type: "opportunity" as const, event: stage === "Target" ? "Prospect prioritized for outreach" : `${stage} stage reached in the simulated scenario` }],
    mainUseCase: strategy.mainUseCase, followUp: strategy.followUp,
  };
  return { ...base, opportunityScore: calculateOpportunityScore(base) };
}

function simulatedSegments(strategy: StrategyHypothesis, profile: Profile, random: () => number): Segment[] {
  return strategy.segments.map((segment, index) => { const base = { name: segment.name, companies: 160 + Math.round(random() * 740), opportunity: 94 - index * 5 + Math.round(random() * 2), pain: 93 - index * 5 + Math.round(random() * 2), fit: 96 - index * 5 + Math.round(random() * 2), competition: 40 + index * 6 + Math.round(random() * 3), dealSize: profile.dealRange[0] + Math.round(random() * (profile.dealRange[1] - profile.dealRange[0])), salesCycle: profile.salesCycle[0] + Math.round(random() * (profile.salesCycle[1] - profile.salesCycle[0])), ease: 88 - index * 6 + Math.round(random() * 3), rationale: segment.rationale }; return { ...base, score: calculateMarketScore(base) }; }).sort((a, b) => b.score - a.score);
}

function simulatedCampaigns(strategy: StrategyHypothesis, profile: Profile): Campaign[] {
  const patterns = [{ spend: 26000, impressions: 170000, clicks: 5100, leads: 560, mqls: 112, meetings: 27, opportunities: 8, pipelineMultiple: 7.4, revenueMultiple: 1.8 }, { spend: 17000, impressions: 62000, clicks: 2800, leads: 230, mqls: 79, meetings: 28, opportunities: 10, pipelineMultiple: 9.2, revenueMultiple: 2.7 }, { spend: 41000, impressions: 390000, clicks: 3900, leads: 500, mqls: 68, meetings: 17, opportunities: 6, pipelineMultiple: 5.5, revenueMultiple: 1.1 }, { spend: 29000, impressions: 11000, clicks: 420, leads: 48, mqls: 32, meetings: 19, opportunities: 8, pipelineMultiple: 8.6, revenueMultiple: 3.1 }, { spend: 49000, impressions: 230000, clicks: 8500, leads: 880, mqls: 91, meetings: 20, opportunities: 5, pipelineMultiple: 3.8, revenueMultiple: 0.8 }];
  const midpoint = (profile.dealRange[0] + profile.dealRange[1]) / 2;
  return strategy.campaigns.slice(0, 5).map((campaign, index) => { const pattern = patterns[index]; return { ...campaign, spend: pattern.spend, impressions: pattern.impressions, clicks: pattern.clicks, leads: pattern.leads, mqls: pattern.mqls, meetings: pattern.meetings, opportunities: pattern.opportunities, pipeline: Math.round(midpoint * pattern.pipelineMultiple), revenue: Math.round(midpoint * pattern.revenueMultiple) }; });
}

function connectedInsights(segments: Segment[], campaigns: Campaign[], accounts: Account[], strategy: StrategyHypothesis): Insight[] {
  const best = [...campaigns].sort((a, b) => (b.pipeline / b.spend) - (a.pipeline / a.spend))[0];
  const cheap = [...campaigns].sort((a, b) => (a.spend / a.leads) - (b.spend / b.leads))[0];
  const metrics = planMetrics(accounts), topBuyer = strategy.personas[1]?.role ?? strategy.personas[0].role;
  return [{ finding: `${segments[0].name} ranks first in the transparent market-priority model.`, why: "It combines the strongest modeled fit, pain, revenue potential, and practical ease of entry.", action: "Give this segment the first 60% of outbound capacity and use the next segment as a controlled comparison group.", impact: "High" }, { finding: `${cheap.name} produces the cheapest leads but not the strongest pipeline efficiency.`, why: "Low acquisition cost is being offset by weaker qualification and opportunity conversion.", action: `Reduce broad volume spend and shift 15% of budget toward ${best.name}.`, impact: "High" }, { finding: `${topBuyer} is the strongest modeled starting champion for this motion.`, why: "This role feels the operating pain directly and can establish value before the buying group expands.", action: `Start with the ${topBuyer}, then multi-thread to the economic buyer after the problem is quantified.`, impact: "Medium" }, { finding: `The simulated workspace contains ${metrics.qualified} qualified ${metrics.qualified === 1 ? "account" : "accounts"} and ${metrics.coverage.toFixed(1)}× pipeline coverage.`, why: "The revenue plan is exposed if a small number of high-value opportunities slip.", action: "Advance the highest-fit engaged prospects into discovery and add qualified pipeline before increasing the revenue target.", impact: "High" }];
}

export function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function validateGTMInputFields(input: GTMInput): InputErrors {
  const errors: InputErrors = {};
  if (!input.company?.trim()) errors.company = "Enter a company name.";
  if (!input.product?.trim()) errors.product = "Describe the product or service.";
  if (!input.targetMarket?.trim()) errors.targetMarket = "Enter a target market.";
  if (!input.geography?.trim()) errors.geography = "Enter a target geography.";
  if (!input.goal?.trim()) errors.goal = "Choose a primary GTM goal.";
  if (input.website?.trim()) { try { const url = new URL(normalizeWebsite(input.website)); if (!url.hostname.includes(".") && url.hostname !== "localhost") errors.website = "Enter a website such as company.com."; } catch { errors.website = "Enter a website such as company.com."; } }
  if ((input.notes?.length ?? 0) > 1200) errors.notes = "Keep context to 1,200 characters or fewer.";
  return errors;
}

export function validateGTMInput(input: GTMInput) {
  return Object.values(validateGTMInputFields(input))[0] ?? null;
}

function isStringArray(value: unknown, minimum: number) {
  return Array.isArray(value) && value.length >= minimum && value.every((item) => typeof item === "string" && item.trim().length >= 3);
}

export function validateStrategyHypothesis(value: unknown): value is StrategyHypothesis {
  if (!value || typeof value !== "object") return false;
  const strategy = value as StrategyHypothesis;
  return [strategy.summary, strategy.valueProposition, strategy.positioning, strategy.mainUseCase, strategy.followUp].every((item) => typeof item === "string" && item.length >= 20)
    && Array.isArray(strategy.segments) && strategy.segments.length === 5 && strategy.segments.every((item) => item && typeof item.name === "string" && typeof item.rationale === "string")
    && isStringArray(strategy.icp?.strong, 4) && isStringArray(strategy.icp?.moderate, 3) && isStringArray(strategy.icp?.weak, 3)
    && Array.isArray(strategy.personas) && strategy.personas.length >= 4 && strategy.personas.every((item) => typeof item.role === "string" && isStringArray(item.responsibilities, 2) && isStringArray(item.kpis, 2))
    && isStringArray(strategy.messaging?.painPoints, 3) && isStringArray(strategy.messaging?.proofPoints, 3) && isStringArray(strategy.messaging?.discoveryQuestions, 4)
    && Array.isArray(strategy.messaging?.objections) && strategy.messaging.objections.length >= 3
    && Array.isArray(strategy.campaigns) && strategy.campaigns.length === 5 && strategy.campaigns.every((item) => typeof item.name === "string" && typeof item.channel === "string")
    && isStringArray(strategy.recommendations, 4) && isStringArray(strategy.marketIndustries, 4) && isStringArray(strategy.buyingSignals, 4)
    && isStringArray(strategy.accountPainPoints, 3) && isStringArray(strategy.accountTriggers, 3)
    && typeof strategy.nextExperiment?.title === "string" && typeof strategy.nextExperiment?.description === "string";
}

function strategyHasLeakage(input: GTMInput, strategy: StrategyHypothesis) {
  if (resolveProfile(input).id === industrialProfile.id) return false;
  return /sentinel ai|predictive maintenance|reliability director|unplanned downtime|equipment failure|automotive manufacturing/i.test(JSON.stringify(strategy));
}

export function generateMockGTMPlan(input: GTMInput, suppliedStrategy?: StrategyHypothesis, generationMode: GTMPlan["generationMode"] = "illustrative"): GTMPlan {
  const inputError = validateGTMInput(input);
  if (inputError) throw new Error(inputError);
  const profile = resolveProfile(input);
  const strategy = suppliedStrategy && validateStrategyHypothesis(suppliedStrategy) && !strategyHasLeakage(input, suppliedStrategy) ? suppliedStrategy : createIllustrativeStrategy(input);
  const random = seeded(hash(JSON.stringify(input)));
  const segments = simulatedSegments(strategy, profile, random);
  const accounts = Array.from({ length: 20 }, (_, index) => generatedAccount(input, strategy, profile, index, random)).sort((a, b) => b.opportunityScore - a.opportunityScore);
  const campaigns = simulatedCampaigns(strategy, profile);
  return { id: `project-${Date.now()}-${Math.abs(hash(JSON.stringify(input)))}`, createdAt: new Date().toISOString(), isDemo: false, generationMode, strategyProfile: profile.id, input: { ...input, website: normalizeWebsite(input.website) }, estimatedTam: segments.reduce((sum, segment) => sum + segment.companies * segment.dealSize, 0), accountFields: profile.accountFields, summary: strategy.summary, valueProposition: strategy.valueProposition, positioning: strategy.positioning, segments, icp: strategy.icp, personas: strategy.personas, accounts, campaigns, messaging: strategy.messaging, recommendations: strategy.recommendations, insights: connectedInsights(segments, campaigns, accounts, strategy), nextExperiment: strategy.nextExperiment };
}

export function validateGTMPlan(value: unknown): value is GTMPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as GTMPlan;
  const currentCustomShape = plan.isDemo || (typeof plan.strategyProfile === "string" && !!plan.accountFields && (plan.generationMode === "ai" || plan.generationMode === "illustrative"));
  return currentCustomShape && typeof plan.id === "string" && typeof plan.createdAt === "string" && !!plan.input && !validateGTMInput(plan.input) && Array.isArray(plan.segments) && plan.segments.length >= 4 && Array.isArray(plan.personas) && plan.personas.length >= 4 && Array.isArray(plan.accounts) && plan.accounts.length >= 1 && plan.accounts.every((account) => typeof account.company === "string" && Number.isFinite(account.opportunityScore)) && Array.isArray(plan.campaigns) && plan.campaigns.length >= 4 && Array.isArray(plan.recommendations) && Array.isArray(plan.insights) && !!plan.messaging && typeof plan.positioning === "string";
}

export function loadSavedProjects(raw: string | null) {
  if (!raw) return [];
  try { const parsed = JSON.parse(raw) as unknown; return Array.isArray(parsed) ? parsed.filter(validateGTMPlan).slice(0, 8) : []; } catch { return []; }
}

export async function generateGTMPlan(input: GTMInput, mode: "mock" | "api" = "api", onProgress?: GenerationProgress) {
  const error = validateGTMInput(input);
  if (error) throw new Error(error);
  onProgress?.(0);
  if (mode === "api" && typeof window !== "undefined") {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      onProgress?.(1);
      const response = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input), signal: controller.signal });
      if (!response.ok) throw new Error("Generation endpoint failed.");
      onProgress?.(6);
      const result = await response.json() as { plan?: unknown };
      onProgress?.(7);
      if (!validateGTMPlan(result.plan)) throw new Error("Generation response was invalid.");
      onProgress?.(8);
      return result.plan;
    } catch {
      onProgress?.(6);
      const fallback = generateMockGTMPlan(input);
      onProgress?.(8);
      return fallback;
    } finally { window.clearTimeout(timeout); }
  }
  onProgress?.(3);
  const fallback = generateMockGTMPlan(input);
  onProgress?.(8);
  return fallback;
}
