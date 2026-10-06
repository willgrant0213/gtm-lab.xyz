import type { GTMPlan } from "./types";
import { rankResearchAccounts, type ResearchAccount, type ResearchSource } from "./research";

export const researchDate = "October 6, 2026";
export const out2winSources: ResearchSource[] = [
  { id: "company", title: "Brand campaign offering", publisher: "Out2Win", url: "https://out2win.io/", date: "Undated · reviewed Oct 6, 2026" },
  { id: "workflow", title: "How we work", publisher: "Out2Win", url: "https://out2win.io/how-we-work", date: "Undated · reviewed Oct 6, 2026" },
  { id: "role", title: "GTM Associate", publisher: "Out2Win", url: "https://out2win.io/careers/gtm-associate", date: "Undated · reviewed Oct 6, 2026" },
  { id: "cfp", title: "Amazon × College Football Playoff", publisher: "Out2Win", url: "https://out2win.io/outcomes/amazon-college-football-playoff", date: "Campaign: Winter ’25 · as labeled by Out2Win" },
  { id: "prime", title: "Accelerator × Amazon Prime Day", publisher: "Out2Win", url: "https://out2win.io/outcomes/accelerator-amazon-prime-day", date: "Campaign: Summer ’26" },
  { id: "march", title: "Amazon × March Madness", publisher: "Out2Win", url: "https://out2win.io/outcomes/amazon-march-madness", date: "Campaign: Spring ’26" },
  { id: "liquid", title: "Liquid I.V. × LAFC partnership", publisher: "Liquid I.V.", url: "https://www.liquid-iv.com/articles/powering-performance-liquid-iv-and-the-los-angeles-football-club-lafc-unveil-a-three-season-game-changing-partnership", date: "Oct 23, 2025 · date from brand news index" },
  { id: "lmnt", title: "Bradley Beal × LMNT", publisher: "LMNT", url: "https://live.drinklmnt.com/bradley-beal", date: "Undated · reviewed Oct 6, 2026" },
  { id: "celsius", title: "LIVE. FIT. GO. campaign launch", publisher: "Celsius Holdings", url: "https://ir.celsiusholdingsinc.com/news/news-details/2025/Celsius-Redefines-How-to-Fuel-Everyday-Life-with-Launch-of-the-LIVE--FIT--GO--Campaign/default.aspx", date: "Jun 2, 2025" },
  { id: "bodyarmor", title: "BODYARMOR × Barstool Sports", publisher: "BODYARMOR", url: "https://www.drinkbodyarmor.com/partners/barstool-sports", date: "Undated · reviewed Oct 6, 2026" },
  { id: "ae", title: "American Eagle × Tru Kolors", publisher: "American Eagle Outfitters", url: "https://investors.ae.com/press-releases/news-details/2025/American-Eagle-and-Tru-Kolors-by-Travis-Kelce-Debut-Limited-Edition-Collaboration/default.aspx", date: "Aug 27, 2025" },
  { id: "therabody", title: "Therabody × ADAPTIVE", publisher: "Therabody", url: "https://www.therabody.com/blogs/news/therabody-x-adaptive-fueling-paralympic-performance-with-purpose", date: "Aug 14, 2025" },
  { id: "whoop", title: "Paris Saint-Germain × WHOOP", publisher: "WHOOP", url: "https://www.whoop.com/us/en/press-center/paris-saint-germain-and-whoop-announce-a-multi-year-health-and-performance-partnership/", date: "Apr 2, 2026" },
  { id: "oura", title: "ŌURA × Team USA and LA28", publisher: "ŌURA", url: "https://ouraring.com/blog/oura-team-usa/", date: "Feb 6, 2026" },
];

export function researchSource(id: string) {
  const source = out2winSources.find((item) => item.id === id);
  if (!source) throw new Error(`Missing research source: ${id}`);
  return source;
}

const accounts: ResearchAccount[] = [
  {
    id: "liquid-iv", company: "Liquid I.V.", segment: "Beverages & hydration", sourceId: "liquid",
    fact: "The brand announced a three-season LAFC partnership through 2027, including fan activations and digital content.",
    buyer: "Director of Sports / Brand Partnerships",
    factors: [
      { value: 5, reason: "Consumer hydration product with a natural sports audience." },
      { value: 5, reason: "Published LAFC partnership explicitly includes content and fan activation." },
      { value: 5, reason: "Proposed content can direct audiences to a tagged product or retail destination." },
      { value: 3, reason: "Existing sponsorship and agency rights may constrain execution; access is unknown." },
    ],
    hypothesis: "A complementary athlete-creator program could connect existing sports visibility to product consideration.",
    angle: "Extend sports-partnership content beyond match day with everyday training stories and trackable product visits.",
    constraint: "Confirm agency ownership, athlete usage rights and approved product claims before proposing talent.",
    nextAction: "Check CRM ownership, identify the sports-partnership owner, then prepare one activation-extension brief.",
    question: "How do you measure the path from sponsorship content to product visits or retail action?",
  },
  {
    id: "lmnt", company: "LMNT", segment: "Beverages & hydration", sourceId: "lmnt",
    fact: "LMNT publishes a dedicated athlete partnership page featuring NBA player Bradley Beal.",
    buyer: "Head of Partnerships / Influencer Marketing",
    factors: [
      { value: 5, reason: "Hydration and athlete routines are closely aligned." },
      { value: 4, reason: "Named athlete relationship is public, but the page is undated." },
      { value: 5, reason: "A proposed creator test can use tagged landing pages and sample requests." },
      { value: 4, reason: "A narrowly scoped test is plausible; budget and actual buyer access remain unknown." },
    ],
    hypothesis: "A broader mix of athlete communities may complement a flagship partnership without replacing it.",
    angle: "Test community-specific athlete content against a defined product-visit or sample-request objective.",
    constraint: "Reconfirm current partnership scope and avoid unsupported hydration or health claims.",
    nextAction: "Find the partnership owner and ask whether a smaller athlete-community test fits the next campaign window.",
    question: "Where does your current athlete mix leave an audience you still want to reach?",
  },
  {
    id: "bodyarmor", company: "BODYARMOR", segment: "Beverages & hydration", sourceId: "bodyarmor",
    fact: "BODYARMOR describes a Barstool Sports partnership spanning sports media and creator content.",
    buyer: "Director of Sports Marketing",
    factors: [
      { value: 5, reason: "Sports hydration offers a direct athlete-to-product connection." },
      { value: 4, reason: "Sports/creator activity is public; the partnership page does not establish current spend." },
      { value: 5, reason: "Retail-destination traffic is a testable campaign objective." },
      { value: 2, reason: "Existing media partnerships and rights could complicate a new program." },
    ],
    hypothesis: "A focused athlete roster could complement existing media reach with a narrower audience and measurable destination.",
    angle: "Add athlete-specific creative to an existing sports moment, with an agreed retail measurement plan.",
    constraint: "Do not assume Barstool inventory, athletes or exclusivity are available to a new partner.",
    nextAction: "Confirm incumbent partner boundaries before drafting a complementary athlete activation.",
    question: "Which audiences are hardest to reach through your current sports-media partnerships?",
  },
  {
    id: "celsius", company: "CELSIUS", segment: "Beverages & hydration", sourceId: "celsius",
    fact: "CELSIUS announced its LIVE. FIT. GO. campaign with agency Anomaly in June 2025, including brand-partner social amplification.",
    buyer: "Director of Integrated Marketing",
    factors: [
      { value: 5, reason: "Fitness-positioned consumer beverage fits athlete-led content." },
      { value: 4, reason: "Published partner amplification supports the thesis; not proof of a new need." },
      { value: 4, reason: "A complementary test can measure qualified site traffic, subject to destination access." },
      { value: 2, reason: "Anomaly is a named incumbent; pitch a complementary capability, not replacement." },
    ],
    hypothesis: "Athlete-creator execution may add a targeted layer alongside the brand's existing integrated campaigns.",
    angle: "Offer one scoped athlete-content test that complements the existing creative platform.",
    constraint: "The cited campaign is from 2025; verify the current brief, agency responsibilities and timing.",
    nextAction: "Map the brand–agency split and ask where athlete execution would add capacity rather than duplicate work.",
    question: "Who owns athlete selection and execution across your brand and agency teams today?",
  },
  {
    id: "american-eagle", company: "American Eagle", segment: "Apparel & lifestyle", sourceId: "ae",
    fact: "Its August 2025 Tru Kolors collaboration featured Travis Kelce and a roster of collegiate and professional athletes.",
    buyer: "Director of Influencer / Brand Marketing",
    factors: [
      { value: 4, reason: "Consumer apparel has a clear lifestyle and collegiate audience fit." },
      { value: 5, reason: "A published multi-athlete campaign demonstrates direct category precedent." },
      { value: 5, reason: "Product-page visits and attributed purchases are practical proposed measures." },
      { value: 2, reason: "Large-brand approvals and existing talent relationships increase entry friction." },
    ],
    hypothesis: "Campus and lifestyle athletes could extend collection storytelling beyond celebrity-led awareness.",
    angle: "Pair campus-specific creators with a product collection and a defined landing-page test.",
    constraint: "The 2025 collection is historical evidence, not a current launch or available talent roster.",
    nextAction: "Identify the next relevant collection window and its marketing owner before suggesting a pilot.",
    question: "How do you judge whether athlete-led collection content drives shopping rather than just views?",
  },
  {
    id: "therabody", company: "Therabody", segment: "Recovery & wearables", sourceId: "therabody",
    fact: "Therabody announced its ADAPTIVE documentary partnership and work with Ezra Frech's performance team in August 2025.",
    buyer: "Director of Brand Partnerships",
    factors: [
      { value: 4, reason: "Consumer recovery products support an authentic athlete-storytelling use case." },
      { value: 4, reason: "A published athlete/documentary partnership provides precedent, not buying intent." },
      { value: 4, reason: "Approved routine content can connect to tagged product education." },
      { value: 3, reason: "A product-specific test is conceivable; claims and accessibility review are required." },
    ],
    hypothesis: "Inclusive athlete routine content may make product education more relatable to everyday consumers.",
    angle: "Build product-education content around approved everyday routines, not promised performance improvement.",
    constraint: "Confirm usage rights, accessibility and legal approval of every product claim.",
    nextAction: "Prepare a routine-content concept and ask the brand owner which product education gap matters next.",
    question: "Which product needs better consumer understanding, and what claims can creators safely make?",
  },
  {
    id: "whoop", company: "WHOOP", segment: "Recovery & wearables", sourceId: "whoop",
    fact: "WHOOP announced a multi-year Paris Saint-Germain partnership in April 2026, including digital fan engagement.",
    buyer: "Director of Global Brand Marketing",
    factors: [
      { value: 4, reason: "An athlete-to-everyday-consumer narrative fits the membership product." },
      { value: 5, reason: "A dated 2026 professional-team partnership explicitly includes fan engagement." },
      { value: 4, reason: "A proposed test can measure qualified visits and membership consideration." },
      { value: 1, reason: "Global partnership rights, privacy and approval layers create substantial friction." },
    ],
    hypothesis: "Everyday athlete stories could bridge elite-sport visibility and consumer membership consideration.",
    angle: "Translate elite-partnership awareness into accessible everyday training stories with a measurable destination.",
    constraint: "Do not assume PSG rights or access to athlete health data; no medical or guaranteed performance claims.",
    nextAction: "Research the regional campaign owner and existing partner remit before offering a consumer-content extension.",
    question: "Where do elite-sport partnerships help everyday consumers understand the membership?",
  },
  {
    id: "oura", company: "ŌURA", segment: "Recovery & wearables", sourceId: "oura",
    fact: "ŌURA announced its Official Wearable partnership with Team USA and the LA28 Games on February 6, 2026.",
    buyer: "Director of Sports / Brand Partnerships",
    factors: [
      { value: 4, reason: "Consumer wearable storytelling can connect athlete routines to everyday life." },
      { value: 5, reason: "A dated Team USA/LA28 partnership establishes public sports investment." },
      { value: 4, reason: "Approved product-education content can use tagged consideration journeys." },
      { value: 1, reason: "Olympic rights, privacy and long planning horizons make access harder to assume." },
    ],
    hypothesis: "A broader athlete mix could extend everyday product education alongside major-event sponsorship.",
    angle: "Explore approved athlete-routine storytelling that complements, rather than uses unlicensed Olympic assets.",
    constraint: "LA28 planning is a hypothesis, not confirmed demand. Verify rights, privacy rules and current procurement scope.",
    nextAction: "Map who owns sponsorship activation and ask whether a complementary creator brief exists.",
    question: "What can a creator program add beyond the existing sponsorship rights and activation plan?",
  },
];

export const out2winAccounts = rankResearchAccounts(accounts);
export const out2winSegments = [
  { name: "Beverages & hydration", priority: "Start here", reason: "Four researched brands already publish sports/creator activity. Out2Win's beverage case studies give sales relevant evidence.", tradeoff: "Incumbent agencies, category exclusivity and product claims still need checking.", sourceIds: ["prime", "march"] },
  { name: "Apparel & lifestyle", priority: "Second test", reason: "Athlete-led collection storytelling offers a clear path to product consideration, illustrated by American Eagle's published campaign.", tradeoff: "Collection calendars and talent rights may matter more than immediate availability.", sourceIds: ["ae"] },
  { name: "Recovery & wearables", priority: "Selective outreach", reason: "Public athlete partnerships support relevance, but rights, privacy and approval requirements make a first sale harder to assume.", tradeoff: "Avoid medical claims; qualify legal review and existing partner ownership early.", sourceIds: ["therabody", "whoop", "oura"] },
];

export const out2winProof = [
  { sourceId: "cfp", metric: "54 athletes", name: "Amazon × College Football Playoff", result: "Out2Win reports 7.9 million impressions for this campaign.", lesson: "Use as an example of coordinated execution around a sports moment—not a promise of equivalent results." },
  { sourceId: "prime", metric: "5 athletes", name: "Accelerator × Amazon Prime Day", result: "Out2Win describes an Instagram and TikTok activation around a commerce event.", lesson: "Relevant beverage proof: start with the shopping objective, then select talent and content." },
  { sourceId: "march", metric: "12 athletes", name: "Amazon × March Madness", result: "Out2Win reports 19.5 million impressions for an unnamed national beverage brand.", lesson: "The brand is not identified. Views and store traffic are not purchases or Out2Win revenue." },
];

export const out2winPersonas = [
  { role: "VP / Head of Marketing", buyingRole: "Economic buyer", responsibility: "Approve campaign investment and connect brand activity to commercial goals.", pain: "Hard to defend creator spend when success is reduced to impressions.", kpis: "Campaign effectiveness, qualified traffic, attributed commerce where measurable", motivation: "A measurable brief and clear accountability", success: "An agreed business objective, reporting plan and budget owner", objection: "What makes this worth funding?", angle: "Define the business outcome and measurement limits before selecting athletes." },
  { role: "Director of Influencer / Sports Marketing", buyingRole: "Champion", responsibility: "Manage creators, talent fit, briefs, timelines and agency coordination.", pain: "Finding suitable athletes and coordinating execution across many partners.", kpis: "Audience fit, content quality, launch readiness, campaign delivery", motivation: "Less operational friction without losing creative control", success: "A relevant roster, approved creative and dependable delivery", objection: "We already have an agency.", angle: "Find a specific execution or athlete-selection gap; complement the existing team." },
  { role: "Ecommerce / Marketing Analytics Lead", buyingRole: "Measurement evaluator", responsibility: "Agree tagging, destination pages and reporting definitions.", pain: "Clicks, attributed sales and incremental lift often get confused.", kpis: "Qualified visits, conversion, attributed orders, reporting completeness", motivation: "Measurement the team can actually trust", success: "Documented tracking, attribution window and limitations", objection: "Can you prove incremental sales?", angle: "Separate attributed outcomes from causal lift; agree a feasible test design." },
  { role: "Brand Manager / Campaign Producer", buyingRole: "End user", responsibility: "Run the brief, creative approvals and campaign calendar.", pain: "Late content and unclear approvals put launches at risk.", kpis: "On-time delivery, content approval, brand consistency", motivation: "A practical production and approval plan", success: "Clear owners, milestones and usage rights", objection: "We cannot add another workflow.", angle: "Show who handles each task and how the program fits the existing calendar." },
  { role: "Legal / Procurement / Incumbent Agency", buyingRole: "Potential blocker", responsibility: "Review rights, claims, disclosures, terms and partner boundaries.", pain: "New vendors create rights, compliance and coordination risk.", kpis: "Approved contracts, compliant assets, documented rights", motivation: "Defined scope with fewer surprises", success: "Approved usage, disclosures, claims and contracting route", objection: "This overlaps with our existing agreement.", angle: "Clarify the partner remit and legal requirements before promising activation." },
];

export const out2winSteps = [
  { stage: "Research", exit: "Dated source, relevant use case and relationship/ownership check recorded.", question: "Is this account already a customer, partner or owned opportunity?" },
  { stage: "Contact", exit: "Relevant buyer role identified and a specific, evidence-based outreach angle prepared.", question: "Who owns athlete campaigns, and which partner already supports them?" },
  { stage: "Qualify", exit: "Buyer confirms a problem, goal, campaign window and buying process.", question: "Is there a real brief and reason to act, or only general interest?" },
  { stage: "Scope", exit: "Budget range, decision maker, talent/usage constraints and measurement agreed.", question: "What would success mean, and can we measure it responsibly?" },
  { stage: "Proposal", exit: "Defined deliverables, approval path and mutual next step confirmed.", question: "Who signs off, and what remains before contracting?" },
  { stage: "Launch & learn", exit: "Contract signed; delivery and reporting owners assigned. Results feed the next brief.", question: "What did we learn about audience, creative and the commercial outcome?" },
];

export const out2winInsights = [
  { finding: "Beverages offer the most directly relevant starting point in this researched list.", why: "Four candidate brands publish sports/creator activity, and Out2Win publishes beverage campaign examples. This is fit evidence, not a proven best-converting segment.", action: "Start discovery with Liquid I.V. and LMNT after CRM and ownership checks. Compare qualified conversations before widening the list.", sources: ["liquid", "lmnt", "prime", "march"] },
  { finding: "An existing agency can be a route to a brief, not simply an objection.", why: "CELSIUS names Anomaly in its campaign announcement. Out2Win's role description also emphasizes larger brands and agency partnerships.", action: "Map the brand–agency split. Offer a bounded athlete-selection or execution capability rather than an agency replacement.", sources: ["celsius", "role"] },
  { finding: "Big sponsorships demonstrate relevance but can increase entry friction.", why: "WHOOP and ŌURA have published major sports partnerships. Exclusivity, usage rights and approval paths remain unknown.", action: "Keep these as selective research accounts; validate scope and timing before spending a full prospecting block.", sources: ["whoop", "oura"] },
  { finding: "Public case studies help open a conversation; they cannot establish a prospect forecast.", why: "Out2Win publishes campaign outcomes, but their underlying attribution and benchmark methods are not independently audited here.", action: "Use the closest case as evidence of execution. Agree success criteria with each buyer and do not promise a sales uplift.", sources: ["cfp", "prime", "march"] },
];

// Shell identity only. Research content is intentionally separate from the simulation schema.
// Empty operating arrays mean unavailable data, never a zero-revenue assertion.
export const out2winPlan: GTMPlan = {
  id: "out2win-researched", createdAt: "2026-10-06T12:00:00.000Z", isDemo: false,
  strategyProfile: "out2win-researched",
  input: { company: "Out2Win", website: "out2win.io", product: "Athlete-led brand campaigns: intelligence and execution", targetMarket: "Consumer brands running athlete / creator campaigns", geography: "United States — proposed initial sales focus", goal: "Win qualified brand campaign opportunities" },
  summary: "Turn public athlete-marketing evidence into a focused brand acquisition plan.",
  valueProposition: "Help brand teams select athletes, execute campaigns and measure results against an agreed objective.",
  positioning: "For consumer brands that want athlete-led campaigns without stitching together research, talent coordination and reporting, Out2Win combines athlete intelligence with campaign execution. This is proposed positioning, not a validated competitive claim.",
  segments: [], accounts: [], campaigns: [], personas: [],
  icp: {
    strong: ["Consumer product with a credible athlete or sports-audience connection", "Published athlete / creator activity and a distinct next campaign brief", "Identifiable brand or agency owner with an approved measurement destination", "Budget, timing and rights confirmed in discovery—not inferred from company size"],
    moderate: ["Relevant audience, but no confirmed campaign owner or brief", "An incumbent agency that may need complementary athlete execution", "Strong brand fit with a longer approval or sponsorship planning cycle"],
    weak: ["No credible product–athlete connection", "No campaign objective, buying path or usable tracking destination", "A request requiring unlicensed rights, unsupported claims or guaranteed sales"],
  },
  messaging: { painPoints: [], proofPoints: [], coldEmail: "", linkedIn: "", callOpener: "", elevatorPitch: "", discoveryQuestions: [], objections: [] },
  recommendations: ["Start with hydration brands where product–athlete relevance is clear.", "Check existing customer and agency relationships before treating any brand as a new logo.", "Lead with a specific campaign gap, not a generic AI pitch.", "Qualify the brief, owner, timing, budget and measurement before proposing talent."],
  insights: [],
};

export function researchOutreach(account: ResearchAccount) {
  return {
    email: `Subject: Athlete content for ${account.company}\n\nHi [first name],\n\n${account.fact}\n\nOne idea worth testing: ${account.angle.charAt(0).toLowerCase() + account.angle.slice(1)}\n\nOut2Win brings athlete selection and campaign execution together. ${account.question}\n\nIf this is relevant to an upcoming brief, would a short conversation be useful?\n\n[Your name]`,
    linkedIn: `Hi [first name] — I noticed ${account.company}'s published sports/athlete activity. ${account.question} I have a specific athlete-content idea; happy to share if it fits your remit.`,
    call: `Hi [first name], it's [name] with Out2Win. I'm calling about ${account.company}'s athlete-marketing activity. ${account.question}`,
    followUp: `Send one short concept tied to the buyer's stated objective—not a generic deck. If there is no active brief, ask permission to reconnect around a specific planning window. Stop if they decline.`,
  };
}
