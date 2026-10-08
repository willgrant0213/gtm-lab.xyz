"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { out2winAccounts, out2winInsights, out2winPersonas, out2winPlan, out2winProof, out2winSegments, out2winSources, out2winSteps, researchDate, researchOutreach, researchSource } from "../lib/out2win";
import { RESEARCH_CRITERIA, RESEARCH_WEIGHTS, researchPriority, type ResearchAccount } from "../lib/research";

type ResearchView = "Overview" | "Market" | "ICP" | "Accounts" | "Priority Accounts" | "Pipeline" | "Campaigns" | "Messaging" | "Insights";

function useResearchDialog(close: () => void) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.querySelector<HTMLElement>("button, a, input, select")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input, select, [tabindex='0']")];
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", handleKey); previous?.focus(); };
  }, [close]);
  return ref;
}

export function SourceLinks({ ids }: { ids: string[] }) {
  return <div className="research-links">{ids.map((id) => { const source = researchSource(id); return <a key={id} href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher}: {source.title} ↗</a>; })}</div>;
}

function Card({ label, title, children, dark = false }: { label: string; title: string; children: ReactNode; dark?: boolean }) {
  return <section className={`workspace-card research-card ${dark ? "dark-card" : ""}`}><div className="card-heading"><div><span>{label}</span><h2>{title}</h2></div></div>{children}</section>;
}

function Title({ title, description }: { title: string; description: string }) {
  return <div className="page-title"><div><span>OUT2WIN / RESEARCHED GTM PLAN</span><h1>{title}</h1><p>{description}</p></div><span className="research-badge">Sourced case study</span></div>;
}

function Score({ account }: { account: ResearchAccount }) {
  const value = researchPriority(account.factors);
  return <span className={`score ${value >= 80 ? "high" : "medium"}`} aria-label={`Research priority ${value} out of 100`}>{value}</span>;
}

function CopyBlock({ title, text }: { title: string; text: string }) {
  const [status, setStatus] = useState("");
  return <section className="research-copy"><div><h3>{title}</h3><button className="link-button" onClick={async () => { try { await navigator.clipboard.writeText(text); setStatus("Copied"); } catch { setStatus("Select the text below to copy"); } }}>Copy draft</button></div><p className="research-copy-text">{text}</p><small role="status">{status}</small></section>;
}

function ScoreModel() {
  return <section className="formula-card research-formula"><span>RESEARCH PRIORITY — NOT BUYING INTENT</span><div>{RESEARCH_CRITERIA.map((criterion, i) => <span key={criterion}><b>{RESEARCH_WEIGHTS[i]}%</b> {criterion}</span>)}</div><p>Each factor is an editorial 0–5 assessment: 0 = no basis, 1 = limited, 3 = plausible, 5 = strongest support. Score = Σ (factor ÷ 5 × weight). Entry practicality assesses likely execution friction—not verified buyer access. Scores do not use email opens, budgets, revenue or invented intent.</p></section>;
}

function ScoreBreakdown({ account }: { account: ResearchAccount }) {
  return <div className="research-factor-list">{account.factors.map((factor, i) => <div key={RESEARCH_CRITERIA[i]}><div><strong>{RESEARCH_CRITERIA[i]}</strong><span>{factor.value}/5 · {RESEARCH_WEIGHTS[i]}% weight</span></div><div className="bar-track"><i style={{ width: `${factor.value * 20}%` }} /></div><p>{factor.reason}</p></div>)}</div>;
}

function Overview({ setView, openAccount }: { setView: (view: ResearchView) => void; openAccount: (account: ResearchAccount) => void }) {
  return <>
    <Title title="A focused plan for the next brand brief." description="Public company facts → relevant brands → buyer hypotheses → qualified campaign opportunities. An independent GTM proposal, not Out2Win’s internal operating plan." />
    <div className="dashboard-grid overview-lead">
      <Card label="SOURCED COMPANY CONTEXT" title="What Out2Win sells">
        <p>Out2Win presents an athlete-influencer campaign offering for consumer brands, combining athlete intelligence with campaign execution and measurement.</p><SourceLinks ids={["company", "workflow"]} />
        <dl className="overview-facts"><div><dt>Target customer</dt><dd>Consumer brands running athlete / creator campaigns</dd></div><div><dt>Proposed starting market</dt><dd>U.S. beverage & hydration brands</dd></div></dl>
        <details className="inline-details"><summary>Why focus on brand acquisition?</summary><p>The GTM Associate role emphasizes finding relevant brands, getting meetings, qualifying opportunities, using AI workflows and feeding market feedback into the business. It also describes an upmarket direction toward larger brands and agency partnerships.</p><SourceLinks ids={["role"]} />
        <p className="research-note">Scope choice: start with the brand campaign buyer. Out2Win’s separate talent-agency offering is not treated as the same sales motion.</p></details>
      </Card>
      <Card label="PROPOSED COMMERCIAL THESIS" title="Fit before volume.">
        <p>Start where a consumer product, athlete audience and measurable campaign objective overlap. A sponsorship announcement earns a research slot—not a qualified opportunity.</p>
        <ol className="recommendations">{out2winPlan.recommendations.slice(0, 3).map((item, i) => <li key={item}><b>0{i + 1}</b><span>{item}</span></li>)}</ol>
        <details className="inline-details"><summary>One more recommendation</summary><ol className="recommendations" start={4}>{out2winPlan.recommendations.slice(3).map((item, i) => <li key={item}><b>0{i + 4}</b><span>{item}</span></li>)}</ol></details>
      </Card>
    </div>
    <div className="overview-section-heading"><div><span>RESEARCH SNAPSHOT</span><h2>What this plan is built on</h2></div><button className="link-button" onClick={() => setView("Campaigns")}>Explore published proof →</button></div>
    <div className="metric-grid research-metrics overview-metrics">
      <div className="metric-card"><span>Proposed first segment</span><strong>Beverages</strong><small>Relevant product fit + published campaign proof</small></div>
      <div className="metric-card"><span>Curated brand candidates</span><strong>{out2winAccounts.length}</strong><small>Real brands · relationships not confirmed</small></div>
      <div className="metric-card"><span>Published campaign examples</span><strong>{out2winProof.length}</strong><small>Company-reported, not independently audited</small></div>
      <div className="metric-card"><span>Actual pipeline / revenue</span><strong>Unknown</strong><small>No CRM access or private financial data</small></div>
    </div>
    <details className="overview-details"><summary><span>First prospecting block</span><small>Three brands to research & a discovery checklist</small></summary>
    <div className="dashboard-grid">
      <Card label="FIRST PROSPECTING BLOCK" title="Research these brands first">
        {out2winAccounts.slice(0, 3).map((account, i) => <button className="research-account-short" onClick={() => openAccount(account)} key={account.id}><span>0{i + 1}</span><div><strong>{account.company}</strong><small>{account.buyer} · proposed role</small></div><Score account={account} /><span aria-hidden="true">→</span></button>)}
        <p className="research-note">Before outreach: confirm existing customer status, CRM ownership and incumbent partner scope. No contacts or messages have been sent.</p>
      </Card>
      <Card label="DISCOVERY BEFORE FORECAST" title="Five things we still need to know">
        <ul className="research-list"><li>Who owns the brand’s next athlete / creator brief?</li><li>What outcome is the buyer trying to achieve?</li><li>What campaign window and budget are actually available?</li><li>Which rights, agencies and approvals constrain execution?</li><li>What can the team credibly measure?</li></ul>
        <button className="link-button" onClick={() => setView("Pipeline")}>See qualification gates →</button>
      </Card>
    </div>
    </details>
    <details className="overview-details"><summary><span>Quick tour</span><small>Four stops through the researched plan</small></summary><section className="recruiter-tour"><div><span>INTERVIEW QUICK TOUR</span><strong>Show the reasoning, then the next action.</strong></div>{(["Market", "Priority Accounts", "Campaigns", "Insights"] as const).map((view, i) => <button key={view} onClick={() => setView(view)}><b>0{i + 1}</b><span>{view === "Campaigns" ? "Published proof" : view}</span></button>)}</section></details>
  </>;
}

function Market() {
  return <><Title title="Choose a market with a reason." description="A deliberately small, researched beachhead—not a fabricated TAM estimate. Segment ordering is a strategic recommendation, not observed conversion performance." />
    <div className="research-segment-grid">{out2winSegments.map((segment, i) => { const sample = out2winAccounts.filter((a) => a.segment === segment.name); return <Card key={segment.name} label={`0${i + 1} / ${segment.priority}`} title={segment.name}><p>{segment.reason}</p><div className="research-segment-stat"><strong>{sample.length}</strong><span>brands researched in this list<br />Not the total addressable market</span></div><h3>Commercial tradeoff</h3><p>{segment.tradeoff}</p><SourceLinks ids={segment.sourceIds} /></Card>; })}</div>
    <Card label="EXPANSION PATH" title="Use agencies as a route, not a shortcut"><p>After the brand beachhead, test whether an agency needs athlete intelligence or execution capacity for a specific client brief. Confirm who controls the budget and whether the partner relationship creates opportunity or channel conflict. No agency pipeline has been validated here.</p><SourceLinks ids={["role", "celsius"]} /></Card>
    <ScoreModel />
    <Card label="WHAT WOULD CHANGE THE PLAN?" title="Let qualification results guide expansion"><p>Compare confirmed briefs, qualified meetings, budget availability and agency friction across segments. Expand the list only when conversations reveal repeatable demand. Brand size or follower counts alone do not establish buying capacity.</p><p className="research-note">TAM, segment spend, deal size, sales cycle and competitive win rates are unavailable. They have not been estimated to fill the dashboard.</p></Card>
  </>;
}

function ICP() {
  const [active, setActive] = useState(0);
  const persona = out2winPersonas[active];
  return <><Title title="Qualify the campaign, not just the logo." description="Proposed ICP and buyer-role hypotheses. These are not verified employee responsibilities, named contacts or confirmed purchasing relationships." />
    <div className="fit-grid">{(["strong", "moderate", "weak"] as const).map((fit) => <section key={fit} className={`fit-card ${fit}`}><span>{fit} fit</span><b>{fit === "strong" ? "Prioritize" : fit === "moderate" ? "Validate" : "Deprioritize"}</b><ul>{out2winPlan.icp[fit].map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>
    <Card label="HYPOTHESIZED BUYING COMMITTEE" title="Find the owner and the approval path"><div className="persona-layout"><div className="persona-tabs">{out2winPersonas.map((item, i) => <button key={item.role} className={active === i ? "active" : ""} onClick={() => setActive(i)} aria-pressed={active === i}><small>{item.buyingRole}</small><strong>{item.role}</strong></button>)}</div><div className="persona-detail"><div className="persona-hero"><div><span>{persona.buyingRole}</span><h3>{persona.role}</h3></div><p>{persona.angle}</p></div><div className="research-persona-grid">{[["Responsibilities", persona.responsibility], ["KPIs to ask about", persona.kpis], ["Likely pain — validate", persona.pain], ["Buying motivation", persona.motivation], ["Success criteria", persona.success], ["Common objection", persona.objection]].map(([label, text]) => <div key={label}><h4>{label}</h4><p>{text}</p></div>)}</div></div></div></Card>
    <p className="research-note">Geography: proposed U.S. starting focus. Revenue, employee thresholds and campaign budgets are not known; confirm buying capacity through the brief, not guessed firmographics.</p>
  </>;
}

function Accounts({ priority, openAccount, onViewAccounts }: { priority: boolean; openAccount: (account: ResearchAccount) => void; onViewAccounts: () => void }) {
  const [search, setSearch] = useState(""); const [segment, setSegment] = useState(""); const [sort, setSort] = useState("priority");
  const filtered = out2winAccounts.filter((account) => (!segment || account.segment === segment) && `${account.company} ${account.buyer}`.toLowerCase().includes(search.toLowerCase()));
  const sorted = sort === "name" ? [...filtered].sort((a, b) => a.company.localeCompare(b.company)) : filtered;
  if (priority) return <><Title title="Three brands to investigate first." description="A focused shortlist from the eight researched candidates. Published evidence supports the ranking; fit, buyer roles and next steps remain hypotheses—not confirmed buying intent." />
    <div className="priority-list-heading"><span>Top 3 of {out2winAccounts.length} researched brands</span><button className="link-button" onClick={onViewAccounts}>View all accounts →</button></div>
    <div className="priority-stack research-priority-stack">{out2winAccounts.slice(0, 3).map((account, index) => <article className="priority-account" key={account.id}>
      <div className="priority-rank"><span>Priority</span><b>{String(index + 1).padStart(2, "0")}</b></div>
      <div className="priority-main"><div className="priority-company"><div><span>{account.segment}</span><h2>{account.company}</h2></div><Score account={account} /></div>
        <div className="priority-evidence"><small>PUBLISHED EVIDENCE</small><p>{account.fact}</p><SourceLinks ids={[account.sourceId]} /></div>
        <div className="research-priority-grid"><div><small>WHY INVESTIGATE · HYPOTHESIS</small><p>{account.hypothesis}</p></div><div><small>PROPOSED BUYER</small><p>{account.buyer}</p><small>No named contact confirmed</small></div></div>
        <div className="priority-actions"><div><small>NEXT ACTION</small><p>{account.nextAction}</p></div><div><small>CHECK BEFORE OUTREACH</small><p>{account.constraint}</p></div><button onClick={() => openAccount(account)}>Open researched brief →</button></div>
      </div></article>)}</div>
    <details className="inline-details priority-method"><summary>How research priority is assessed</summary><ScoreModel /></details>
  </>;
  return <><Title title="Real brands. Explicit hypotheses." description="Eight researched candidates, not confirmed prospects or new customers. Existing Out2Win relationships, budgets and contact details must be checked internally." />
    <div className="filter-bar research-filters"><label className="search-field"><input aria-label="Search researched brands" placeholder="Search brand or buyer role" value={search} onChange={(e) => setSearch(e.target.value)} /></label><select aria-label="Filter researched segment" value={segment} onChange={(e) => setSegment(e.target.value)}><option value="">All segments</option>{out2winSegments.map((item) => <option key={item.name}>{item.name}</option>)}</select><select aria-label="Sort researched brands" value={sort} onChange={(e) => setSort(e.target.value)}><option value="priority">Research priority: high to low</option><option value="name">Brand: A–Z</option></select><span>{sorted.length} of {out2winAccounts.length} brands</span></div>
    <section className="workspace-card research-table-wrap"><table className="research-table"><caption>Researched brand candidates · intent, deal value and current stage unknown</caption><thead><tr><th scope="col">Rank / brand</th><th scope="col">Published evidence</th><th scope="col">Proposed buyer</th><th scope="col">Priority</th><th scope="col">Action</th></tr></thead><tbody>{sorted.map((account) => <tr key={account.id}><td><strong><span className="research-rank">{String(out2winAccounts.indexOf(account) + 1).padStart(2, "0")}</span>{account.company}</strong><small>{account.segment}</small></td><td><p>{account.fact}</p><SourceLinks ids={[account.sourceId]} /></td><td>{account.buyer}<small>Role hypothesis · no named contact</small></td><td><Score account={account} /><small>Research only</small></td><td><button className="primary-small" onClick={() => openAccount(account)}>Open brief →</button></td></tr>)}</tbody></table>{!sorted.length && <div className="research-empty"><h3>No matching brands</h3><p>Try another name, role or segment.</p><button className="link-button" onClick={() => { setSearch(""); setSegment(""); }}>Clear filters</button></div>}</section>
  </>;
}

function Pipeline() {
  return <><Title title="Earn the right to call it pipeline." description="A proposed qualification workflow. None of the researched brands has been contacted or assigned a fabricated deal, stage, probability or contract value." />
    <div className="research-unknowns">{["Live opportunity count", "Pipeline value", "Win rate", "Average contract value"].map((item) => <div key={item}><span>{item}</span><strong>Unknown</strong><small>Requires Out2Win’s operating data</small></div>)}</div>
    <section className="workspace-card research-process"><div className="card-heading"><div><span>PROPOSED SALES EXECUTION</span><h2>Evidence → conversation → confirmed brief</h2></div></div>{out2winSteps.map((step, i) => <div className="research-process-step" key={step.stage}><b>0{i + 1}</b><div><h3>{step.stage}</h3><p>{step.exit}</p><small>{step.question}</small></div></div>)}</section>
    <div className="dashboard-grid"><Card label="OPPORTUNITY ENTRY RULE" title="Do not qualify a logo"><p>Open an opportunity only when the buyer confirms a real campaign need, an accountable owner, a plausible campaign window and an agreed next step. Treat budget and authority as open questions until confirmed.</p></Card><Card label="REVENUE MEASUREMENT" title="Two businesses, two sets of results"><p>Brand campaign impressions, traffic and purchases are client outcomes. Out2Win’s own revenue is the contracted commercial agreement. A client’s campaign impressions must never be shown as Out2Win sales or pipeline.</p></Card></div>
  </>;
}

function Campaigns() {
  return <><Title title="Use the closest proof. Design the next test." description="Published client campaigns appear separately from proposed Out2Win acquisition programs. No invented spend, CAC, leads or revenue is attached to either." />
    <div className="research-segment-grid">{out2winProof.map((proof) => <Card key={proof.sourceId} label="PUBLISHED CLIENT WORK / COMPANY-REPORTED" title={proof.name}><div className="research-proof-stat">{proof.metric}</div><p>{proof.result}</p><p className="research-note">{proof.lesson}</p><SourceLinks ids={[proof.sourceId]} /><small>{researchSource(proof.sourceId).date}</small></Card>)}</div>
    <Card label="MEASUREMENT LIMITS" title="Evidence of execution—not an audited ROI promise"><p>These examples are Out2Win’s own published claims. Raw datasets, attribution windows and benchmark definitions were not independently verified. Campaigns differ in objectives, channels and timing, so these results cannot rank Out2Win’s acquisition channels or predict another brand’s performance.</p></Card>
    <div className="dashboard-grid">{[
      { title: "Hydration activation brief", audience: "Liquid I.V. and LMNT", offer: "A short, account-specific concept tied to published sports activity and one measurable product destination.", measure: "Qualified conversations → confirmed briefs → scoped opportunities. Log reply reasons, not just response volume." },
      { title: "Complementary agency capability", audience: "Brand owners with an incumbent agency", offer: "A defined athlete-selection or execution gap the agency can incorporate into an existing brief.", measure: "Introductions to a brief owner, accepted scope, partner conflict and time to next step." },
    ].map((campaign) => <Card key={campaign.title} label="PROPOSED ACQUISITION EXPERIMENT / NOT RUN" title={campaign.title}><h3>Audience</h3><p>{campaign.audience}</p><h3>Offer</h3><p>{campaign.offer}</p><h3>Measure what matters</h3><p>{campaign.measure}</p></Card>)}</div>
    <p className="research-note">Budget recommendation: no dollar reallocation without real channel costs and qualified-opportunity results. Cheap replies or high reach are not a substitute for qualified demand.</p>
  </>;
}

const objections = [
  ["We already have an agency.", "That may be the right setup. Where, if anywhere, do athlete selection or execution create extra work? If there is no gap, this may not be a fit."],
  ["Can you guarantee sales?", "No. Agree the objective, tracking and reporting limits first. Attribution is not automatically proof of incremental sales."],
  ["There is no campaign budget right now.", "Do not force a proposal. Ask whether there is a specific planning window worth revisiting, with permission."],
  ["Why athletes instead of general creators?", "Only when audience, product and story make them the better fit. Compare the brief rather than assuming athletes always outperform."],
];

function Messaging() {
  const [accountId, setAccountId] = useState(out2winAccounts[0].id);
  const account = out2winAccounts.find((item) => item.id === accountId)!;
  const outreach = researchOutreach(account);
  return <><Title title="Make the reason to talk specific." description="Proposed positioning and outreach drafts, grounded in public activity. Replace placeholders and verify the brief before use. Nothing is sent from this app." />
    <Card label="PROPOSED POSITIONING" title="A connected athlete-campaign workflow"><p>{out2winPlan.positioning}</p><h3>Core value proposition</h3><p>{out2winPlan.valueProposition}</p><SourceLinks ids={["company", "workflow"]} /><p className="research-note">Difference to test: coordinated athlete selection, execution and measurement. No claim of exclusive technology or superiority over all agencies.</p></Card>
    <div className="research-persona-messages">{out2winPersonas.slice(0, 4).map((persona) => <Card key={persona.role} label={persona.buyingRole} title={persona.role}><p>{persona.angle}</p></Card>)}</div>
    <Card label="PERSONALIZED OUTREACH / UNSENT DRAFTS" title={`Start a conversation with ${account.company}`}><label className="research-select-label">Choose a researched brand<select value={accountId} onChange={(e) => setAccountId(e.target.value)}>{out2winAccounts.map((item) => <option value={item.id} key={item.id}>{item.company}</option>)}</select></label><SourceLinks ids={[account.sourceId]} /><CopyBlock title="Cold email" text={outreach.email} /><CopyBlock title="LinkedIn message" text={outreach.linkedIn} /><CopyBlock title="Call opener" text={outreach.call} /><h3>Discovery</h3><ul className="research-list"><li>{account.question}</li><li>What brief or business goal would make this worth considering?</li><li>Who owns the budget, approvals and existing partner relationships?</li><li>What is the campaign window, and what constraints should we know?</li><li>What can you measure today, and what would success look like?</li></ul></Card>
    <Card label="OBJECTION HANDLING" title="Qualify honestly, then move forward">{objections.map(([objection, response]) => <div className="research-objection" key={objection}><h3>{objection}</h3><p>{response}</p></div>)}<h3>Follow-up</h3><p>{outreach.followUp}</p></Card>
  </>;
}

function Insights({ setView }: { setView: (view: ResearchView) => void }) {
  return <><Title title="What the GTM team should do next." description="Evidence-based recommendations, not claims about Out2Win’s actual conversion rates or historical performance." />
    <div className="dashboard-grid">{out2winInsights.map((insight, i) => <Card key={insight.finding} label={`0${i + 1} / STRATEGIC RECOMMENDATION`} title={insight.finding}><h3>Why it matters</h3><p>{insight.why}</p><h3>Recommended action</h3><p>{insight.action}</p><SourceLinks ids={insight.sources} /></Card>)}</div>
    <Card label="PROPOSED TWO-WEEK EXPERIMENT / NOT A COMPANY TARGET" title="Test brief quality before scaling outbound" dark><p>Start with the top two hydration brands after ownership checks. Develop one tailored concept for each; confirm the buyer role and seek permission for a discovery conversation. Log the brief, budget status, timing, agency scope and objection reasons.</p><p>Success is learning whether a real campaign need exists—not hitting an invented meeting quota. Share findings with the team, refine the ICP and only then expand to the next segment.</p><button className="primary-small" onClick={() => setView("Priority Accounts")}>Open the research shortlist →</button></Card>
    <p className="research-note">Unknowns requiring internal validation: current customer roster, territory ownership, pricing, gross margin, campaign minimums, sales cycle, quotas, pipeline and attribution methodology.</p>
  </>;
}

function AccountBrief({ account, close }: { account: ResearchAccount; close: () => void }) {
  const ref = useResearchDialog(close);
  const [tab, setTab] = useState("brief");
  const outreach = researchOutreach(account);
  return <div className="provenance-backdrop"><button className="provenance-dismiss" onClick={close} aria-label="Close researched account brief" /><section ref={ref} className="research-brief" role="dialog" aria-modal="true" aria-labelledby="research-brief-title"><header><div><span>REAL BRAND / RESEARCH CANDIDATE</span><h2 id="research-brief-title">{account.company}</h2><p>{account.segment}</p></div><button onClick={close} aria-label="Close researched account brief">×</button></header><div className="research-brief-tabs" aria-label="Account brief sections">{["brief", "outreach", "evidence"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)} aria-pressed={tab === item}>{item === "brief" ? "Account brief" : item === "outreach" ? "Outreach assistant" : "Evidence & scoring"}</button>)}</div><div className="research-brief-body">
      <p className="research-note">Intent, budget, current sales stage and Out2Win relationship are unknown. This is not a qualified opportunity.</p>
      {tab === "brief" && <><h3>Company overview · public evidence</h3><p>{account.fact}</p><SourceLinks ids={[account.sourceId]} /><h3>Why this account may fit · hypothesis</h3><p>{account.hypothesis}</p><h3>Campaign need to validate</h3><p>{account.question}</p><h3>Potential trigger—not current intent</h3><p>The published activity gives a relevant conversation starter. Ask whether there is a next brief; do not assume the original announcement creates an active buying window.</p><h3>Buyer map · proposed roles</h3><dl className="research-buyer-map">{[["Economic buyer", "VP / Head of Marketing"], ["Champion", account.buyer], ["Measurement evaluator", "Ecommerce / Analytics Lead"], ["End user", "Brand Manager / Producer"], ["Potential blocker", "Legal, procurement or incumbent agency"]].map(([role, person]) => <div key={role}><dt>{role}</dt><dd>{person}</dd></div>)}</dl><h3>Suggested outreach angle</h3><p>{account.angle}</p><h3>Constraint to resolve</h3><p>{account.constraint}</p><div className="research-next-action"><span>RECOMMENDED NEXT ACTION</span><p>{account.nextAction}</p><button className="primary-small" onClick={() => setTab("outreach")}>Prepare outreach →</button></div></>}
      {tab === "outreach" && <><SourceLinks ids={[account.sourceId]} /><CopyBlock title="Cold email" text={outreach.email} /><CopyBlock title="LinkedIn message" text={outreach.linkedIn} /><CopyBlock title="Call opener" text={outreach.call} /><h3>Discovery questions</h3><ul className="research-list"><li>{account.question}</li><li>Is there an upcoming brief, owner and approved budget?</li><li>Which partner rights or approvals would constrain a pilot?</li><li>Which outcome can we measure, and what is the decision path?</li></ul><h3>Likely objection</h3><p>{account.constraint}</p><h3>Recommended response</h3><p>Clarify the existing scope first. Propose only work that fills an agreed gap; do not promise rights, results or a launch date before approval.</p><h3>Follow-up suggestion</h3><p>{outreach.followUp}</p></>}
      {tab === "evidence" && <><div className="research-score-heading"><div><h3>Research priority</h3><p>Editorial model · not intent or probability</p></div><Score account={account} /></div><ScoreBreakdown account={account} /><h3>Public research record</h3><p>{researchSource(account.sourceId).date}</p><p>{account.fact}</p><SourceLinks ids={[account.sourceId]} /><p className="research-note">Reviewed {researchDate}. No fabricated email opens, visits or meetings appear in this research record.</p></>}
    </div></section></div>;
}

export function ResearchSources({ close }: { close: () => void }) {
  const ref = useResearchDialog(close);
  return <div className="provenance-backdrop"><button className="provenance-dismiss" onClick={close} aria-label="Close research sources" /><section ref={ref} className="provenance-modal research-sources" role="dialog" aria-modal="true" aria-labelledby="research-sources-title"><header><div><span>RESEARCH & METHODOLOGY</span><h2 id="research-sources-title">What is sourced—and what is proposed?</h2></div><button onClick={close} aria-label="Close research sources">×</button></header><div className="research-sources-body"><p>Independent case study prepared for a GTM interview. Not affiliated with or endorsed by Out2Win. Research reviewed {researchDate}; links and company claims can change.</p><div className="research-trust-grid"><article><h3>Public evidence</h3><p>Company offerings, role requirements and brand announcements, linked to first-party sources.</p></article><article><h3>Company-reported outcomes</h3><p>Out2Win’s published case studies. Not independently audited and not GTM Lab results.</p></article><article><h3>Proposed strategy</h3><p>ICP, buyer roles, scores, outreach and recommendations are editorial hypotheses to validate.</p></article><article><h3>Unknown—not simulated</h3><p>Private revenue, pipeline, budgets, intent, contact details and customer relationships. No enrichment, CRM connection or live lookup.</p></article></div><h3>Source register · {out2winSources.length} first-party references</h3><ol className="research-source-register">{out2winSources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><small>{source.publisher} · {source.date}</small></li>)}</ol><p className="research-note">A curated snapshot, not an automatic company-research feature. Creating another project through the form still uses the illustrative generator unless optional AI is configured; it does not retrieve company facts.</p></div><footer><button onClick={close}>Return to workspace</button></footer></section></div>;
}

export default function ResearchedWorkspace({ view, setView, openSources }: { view: ResearchView; setView: (view: ResearchView) => void; openSources: () => void }) {
  const [selected, setSelected] = useState<ResearchAccount | null>(null);
  const closeAccount = useCallback(() => setSelected(null), []);
  return <div className="research-workspace"><div className="research-banner"><div><strong>Public evidence + proposed strategy</strong><span>Reviewed {researchDate} · private operating metrics unknown</span></div><button onClick={openSources}>Sources & limits ↗</button></div>
    {view === "Overview" && <Overview setView={setView} openAccount={setSelected} />}
    {view === "Market" && <Market />}
    {view === "ICP" && <ICP />}
    {(view === "Accounts" || view === "Priority Accounts") && <Accounts key={view} priority={view === "Priority Accounts"} openAccount={setSelected} onViewAccounts={() => setView("Accounts")} />}
    {view === "Pipeline" && <Pipeline />}
    {view === "Campaigns" && <Campaigns />}
    {view === "Messaging" && <Messaging />}
    {view === "Insights" && <Insights setView={setView} />}
    {selected && <AccountBrief key={selected.id} account={selected} close={closeAccount} />}
  </div>;
}
