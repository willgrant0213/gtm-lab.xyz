/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions, react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { generateGTMPlan, loadSavedProjects, validateGTMInputFields } from "../lib/generator";
import { campaignMetrics, calculateOpportunityScore, planMetrics, STAGE_PROBABILITY } from "../lib/scoring";
import { sentinelPlan } from "../lib/sentinel";
import type { Account, GTMInput, GTMPlan, Persona } from "../lib/types";

const views = ["Overview", "Market", "ICP", "Accounts", "Priority Accounts", "Pipeline", "Campaigns", "Messaging", "Insights"] as const;
type View = (typeof views)[number];

const generationSteps = ["Analyzing company", "Understanding product", "Segmenting market", "Building ICP", "Identifying buyer personas", "Creating account strategy", "Developing messaging", "Simulating pipeline", "Generating recommendations"];
const stages = ["Target", "Contacted", "Engaged", "Qualified", "Discovery", "Evaluation", "Negotiation", "Closed Won"];
const emptyInput: GTMInput = { company: "", website: "", product: "", targetMarket: "", geography: "", goal: "", notes: "" };

function money(value: number, compact = true) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 0 }).format(value);
}

function countLabel(count: number, noun = "account") {
  const plural = noun.endsWith("y") ? `${noun.slice(0, -1)}ies` : noun.endsWith("s") ? `${noun}es` : `${noun}s`;
  return `${count} ${count === 1 ? noun : plural}`;
}

function accountScale(account: Account) {
  return account.scaleValue ?? (account.facilities ? String(account.facilities) : "—");
}

function useDialogFocus(close: () => void) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.querySelector<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])")];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.removeEventListener("keydown", keydown); previous?.focus(); };
  }, [close]);
  return ref;
}

function Logo() {
  return <div className="app-logo"><span>G</span><strong>GTM Lab</strong></div>;
}

function TrustBadge({ demo = false }: { demo?: boolean }) {
  return <span className={`trust-badge ${demo ? "demo" : ""}`}><i />{demo ? "Sentinel demo" : "Simulated scenario"}</span>;
}

function Score({ value, size = "normal" }: { value: number; size?: "small" | "normal" | "large" }) {
  const tone = value >= 80 ? "high" : value >= 65 ? "medium" : "low";
  return <span className={`score score-${size} ${tone}`}>{value}</span>;
}

function Landing({ input, setInput, onDemo, onGenerate, onProjects, hasProjects, generationError }: { input: GTMInput; setInput: React.Dispatch<React.SetStateAction<GTMInput>>; onDemo: () => void; onGenerate: (input: GTMInput) => void; onProjects: () => void; hasProjects: boolean; generationError: string }) {
  const [errors, setErrors] = useState<Partial<Record<keyof GTMInput, string>>>({});
  const fieldRefs = useRef<Partial<Record<keyof GTMInput, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>>({});
  const update = (field: keyof GTMInput, value: string) => { setInput((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateGTMInputFields(input);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const first = (["company", "website", "product", "targetMarket", "geography", "goal", "notes"] as (keyof GTMInput)[]).find((field) => nextErrors[field]);
      if (first) window.setTimeout(() => fieldRefs.current[first]?.focus(), 0);
      return;
    }
    setErrors({});
    onGenerate(input);
  };

  return (
    <main className="landing-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GTM Lab home"><span className="brand-mark">G</span><span>GTM Lab</span></a>
        <nav aria-label="Primary navigation">
            <a href="#methodology">About</a><a href="#demo">Demo Workspace</a>
          {hasProjects && <button className="text-button" onClick={onProjects}>My Projects</button>}
          <span className="status-chip"><span />Interactive Prototype</span>
        </nav>
      </header>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">AI-assisted go-to-market planning</p>
          <h1>Turn a market thesis into a revenue plan.</h1>
          <p className="hero-description">Define who to sell to, why they should care, which accounts to prioritize, and what your GTM team should do next.</p>
          <div className="workflow" aria-label="GTM workflow"><span>Market</span><i>→</i><span>ICP</span><i>→</i><span>Accounts</span><i>→</i><span>Pipeline</span><i>→</i><span>Revenue</span></div>
          <div className="method-note"><b>Built to show the commercial logic.</b><span>Every account score, pipeline value, and recommendation traces back to the market and ICP.</span></div>
        </div>
        <div className="strategy-panel">
          <div className="panel-heading"><div><p className="step-label">New workspace</p><h2>Build a GTM strategy</h2></div><span className="time-note">Local prototype</span></div>
          <form className="strategy-form" onSubmit={submit}>
            <label>Company name <span className="required-mark">Required</span><input ref={(node) => { fieldRefs.current.company = node; }} value={input.company} onChange={(e) => update("company", e.target.value)} placeholder="e.g. Ramp" aria-invalid={!!errors.company} aria-describedby={errors.company ? "company-error" : undefined} />{errors.company && <small className="field-error" id="company-error">{errors.company}</small>}</label>
            <label>Company website <span className="optional-mark">Optional</span><input ref={(node) => { fieldRefs.current.website = node; }} value={input.website} onChange={(e) => update("website", e.target.value)} placeholder="ramp.com" inputMode="url" aria-invalid={!!errors.website} aria-describedby={errors.website ? "website-error" : undefined} />{errors.website && <small className="field-error" id="website-error">{errors.website}</small>}</label>
            <label className="full-field">Product or service <span className="required-mark">Required</span><input ref={(node) => { fieldRefs.current.product = node; }} value={input.product} onChange={(e) => update("product", e.target.value)} placeholder="Corporate cards and spend management" aria-invalid={!!errors.product} aria-describedby={errors.product ? "product-error" : undefined} />{errors.product && <small className="field-error" id="product-error">{errors.product}</small>}</label>
            <label>Target market <span className="required-mark">Required</span><input ref={(node) => { fieldRefs.current.targetMarket = node; }} value={input.targetMarket} onChange={(e) => update("targetMarket", e.target.value)} placeholder="U.S. professional services firms" aria-invalid={!!errors.targetMarket} aria-describedby={errors.targetMarket ? "market-error" : undefined} />{errors.targetMarket && <small className="field-error" id="market-error">{errors.targetMarket}</small>}</label>
            <label>Target geography <span className="required-mark">Required</span><input ref={(node) => { fieldRefs.current.geography = node; }} value={input.geography} onChange={(e) => update("geography", e.target.value)} placeholder="United States" aria-invalid={!!errors.geography} aria-describedby={errors.geography ? "geography-error" : undefined} />{errors.geography && <small className="field-error" id="geography-error">{errors.geography}</small>}</label>
            <label className="full-field">Primary GTM goal <span className="required-mark">Required</span><select ref={(node) => { fieldRefs.current.goal = node; }} value={input.goal} onChange={(e) => update("goal", e.target.value)} aria-invalid={!!errors.goal} aria-describedby={errors.goal ? "goal-error" : undefined}><option value="">Choose a goal</option><option>Acquire mid-market customers</option><option>Move upmarket</option><option>Enter a new segment</option><option>Improve pipeline conversion</option><option>Launch a new product</option></select>{errors.goal && <small className="field-error" id="goal-error">{errors.goal}</small>}</label>
            <label className="full-field">Optional context <span className="optional-mark">Optional</span><textarea ref={(node) => { fieldRefs.current.notes = node; }} value={input.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Pricing, competitors, sales motion, constraints…" aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : undefined} />{errors.notes && <small className="field-error" id="notes-error">{errors.notes}</small>}</label>
            {generationError && <div className="form-error full-field" role="alert">{generationError} Your inputs are still here—try again.</div>}
            <button className="primary-button full-field" type="submit">Build GTM plan <span>→</span></button>
          </form>
          <div className="generation-trust-strip">
            <span><i className="user-source" />Your inputs</span>
            <span><i className="generated-source" />Generated strategy</span>
            <span><i className="simulated-source" />Simulated metrics</span>
          </div>
          <div className="demo-entry">
            <div className="demo-icon">S</div><div><span className="demo-label">Recruiter-ready demo</span><strong>Explore Sentinel AI</strong><small>Predictive maintenance · Industrial manufacturing</small></div>
            <button type="button" onClick={onDemo}>Open demo <span>↗</span></button>
          </div>
        </div>
      </section>
      <section className="product-preview" aria-label="Sentinel AI workspace preview">
        <div className="preview-header"><div><span className="preview-kicker">Inside the workspace</span><h2>Know exactly where revenue effort should go.</h2></div><p>Every score connects market fit, buyer intent, engagement, deal potential, and timing.</p></div>
        <div className="dashboard-frame" id="demo">
          <aside className="mini-sidebar"><div className="mini-brand"><span>G</span> GTM Lab</div><div className="project-pill"><i>S</i><div><small>Demo project</small><strong>Sentinel AI</strong></div></div><div className="mini-nav">{views.map((view) => <span className={view === "Priority Accounts" ? "active" : ""} key={view}>{view}</span>)}</div></aside>
          <div className="mini-content"><div className="content-topline"><div><small>SALES ENGINE</small><h3>Priority accounts</h3></div><span className="simulation-badge">Illustrative model</span></div><p className="focus-question">If you had 90 minutes to prospect today, start here.</p><div className="score-legend"><span><b>40%</b> ICP fit</span><span><b>25%</b> intent</span><span><b>15%</b> engagement</span><span><b>20%</b> value & timing</span></div><div className="account-list">{sentinelPlan.accounts.slice(0, 3).map((account, index) => <div className="account-row" key={account.company}><span className="account-rank">0{index + 1}</span><div className="account-name"><strong>{account.company}</strong><small>{account.intentSignals[0].label}</small></div><div className="account-value"><small>Est. value</small><strong>{money(account.dealValue)}</strong></div><Score value={account.opportunityScore} /><button type="button" onClick={onDemo}>View brief</button></div>)}</div></div>
        </div>
      </section>
      <section className="methodology-section" id="methodology">
        <div className="methodology-heading"><div><span>HOW GTM LAB WORKS</span><h2>One connected commercial story.</h2></div><p>The prototype models how a company moves from a market hypothesis to prioritized revenue action. Earlier decisions change what appears later.</p></div>
        <div className="methodology-flow">
          {["Market selection", "Ideal customer", "Buyer committee", "Target accounts", "Sales execution", "Pipeline & revenue", "Next actions"].map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span>{index < 6 && <i>→</i>}</div>)}
        </div>
        <div className="methodology-proof">
          <article><span className="source-dot user-source" /><small>USER-PROVIDED</small><h3>What the user knows</h3><p>Company, product, target market, geography, GTM goal, and optional context.</p></article>
          <article><span className="source-dot generated-source" /><small>GENERATED HYPOTHESES</small><h3>What the model proposes</h3><p>Segmentation, ICP, personas, positioning, messaging, and strategic recommendations.</p></article>
          <article><span className="source-dot simulated-source" /><small>SIMULATED SCENARIO</small><h3>What the product models</h3><p>Accounts, intent, engagement, campaign performance, pipeline, and revenue—not verified company data.</p></article>
        </div>
        <div className="methodology-footer"><strong>Portfolio intent</strong><p>GTM Lab turns market, sales, and marketing decisions into one explainable system. It demonstrates how product design can encode GTM logic without presenting hypotheses as fact. No external company research is performed.</p></div>
      </section>
    </main>
  );
}

function PageTitle({ eyebrow, title, description, demo }: { eyebrow: string; title: string; description: string; demo: boolean }) {
  return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><TrustBadge demo={demo} /></div>;
}

function MetricCard({ label, value, detail, featured }: { label: string; value: string; detail: string; featured?: boolean }) {
  return <div className={`metric-card ${featured ? "featured" : ""}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function Overview({ plan, setView }: { plan: GTMPlan; setView: (view: View) => void }) {
  const metrics = planMetrics(plan.accounts);
  const activeStages = stages.map((stage) => ({ stage, accounts: plan.accounts.filter((account) => account.stage === stage) }));
  return <>
    <PageTitle eyebrow="Executive GTM dashboard" title="From market signal to revenue action." description={plan.summary} demo={plan.isDemo} />
    <div className="metric-grid"><MetricCard label="Estimated TAM" value={money(plan.estimatedTam ?? 1_800_000_000)} detail="Illustrative serviceable market" /><MetricCard label="Qualified accounts" value={`${metrics.qualified}`} detail={`of ${countLabel(metrics.targetAccounts, "modeled prospect")}`} /><MetricCard label="Pipeline value" value={money(metrics.pipeline)} detail={countLabel(plan.accounts.filter((a) => a.stage !== "Target").length, "active opportunity")} featured /><MetricCard label="Weighted pipeline" value={money(metrics.weighted)} detail="Stage-adjusted value" /><MetricCard label="Expected revenue" value={money(metrics.expectedRevenue)} detail="Illustrative forecast" /><MetricCard label="Pipeline coverage" value={`${metrics.coverage.toFixed(1)}×`} detail="Target benchmark: 3.0×" /></div>
    <section className="recruiter-tour"><div><span>RECRUITER QUICK TOUR</span><strong>See the GTM logic in under five minutes.</strong></div><button onClick={() => setView("Market")}><b>01</b><span>Market logic</span></button><button onClick={() => setView("Priority Accounts")}><b>02</b><span>Sales priorities</span></button><button onClick={() => setView("Campaigns")}><b>03</b><span>Campaign economics</span></button><button onClick={() => setView("Insights")}><b>04</b><span>Strategic actions</span></button></section>
    <div className="dashboard-grid wide-left">
      <section className="workspace-card"><div className="card-heading"><div><span>REVENUE FLOW</span><h2>Pipeline by stage</h2></div><button className="link-button" onClick={() => setView("Pipeline")}>Open pipeline →</button></div><div className="stage-bars">{activeStages.slice(0, 7).map(({ stage, accounts }) => { const value = accounts.reduce((sum, a) => sum + a.dealValue, 0); return <div className="stage-bar" key={stage}><div><span>{stage}</span><small>{countLabel(accounts.length)}</small></div><div className="bar-track"><i style={{ width: `${Math.max(3, Math.min(100, value / Math.max(metrics.pipeline, 1) * 220))}%` }} /></div><strong>{money(value)}</strong></div>; })}</div></section>
      <section className="workspace-card dark-card"><div className="card-heading"><div><span>WHAT WE RECOMMEND NEXT</span><h2>Five decisions, in order.</h2></div></div><ol className="recommendations">{plan.recommendations.map((recommendation, index) => <li key={recommendation}><b>0{index + 1}</b><span>{recommendation}</span></li>)}</ol></section>
    </div>
    <div className="dashboard-grid thirds"><section className="workspace-card"><div className="card-heading"><div><span>GTM PRIORITIES</span><h2>Where to focus</h2></div></div><ul className="priority-list"><li><b>01</b><div><strong>Highest-fit segment</strong><span>{plan.segments[0].name}</span></div></li><li><b>02</b><div><strong>Priority buyer</strong><span>{plan.personas[1].role}</span></div></li><li><b>03</b><div><strong>Conversion constraint</strong><span>Engaged → Qualified</span></div></li></ul></section><section className="workspace-card"><div className="card-heading"><div><span>ACCOUNT SIGNAL</span><h2>Top opportunities</h2></div><button className="link-button" onClick={() => setView("Priority Accounts")}>View all →</button></div>{plan.accounts.slice(0, 4).map((account) => <div className="compact-account" key={account.id}><Score value={account.opportunityScore} size="small" /><div><strong>{account.company}</strong><span>{account.priorityReason.split(",")[0]}</span></div><b>{money(account.dealValue)}</b></div>)}</section><section className="workspace-card"><div className="card-heading"><div><span>MARKET SIGNAL</span><h2>Segment priority</h2></div></div>{plan.segments.map((segment, index) => <div className="segment-mini" key={segment.name}><span>0{index + 1}</span><div><strong>{segment.name}</strong><i><em style={{ width: `${segment.score}%` }} /></i></div><b>{segment.score}</b></div>)}</section></div>
  </>;
}

function Market({ plan }: { plan: GTMPlan }) {
  return <><PageTitle eyebrow="Market selection" title="Rank markets with visible logic." description="Segments are compared on commercial potential, customer pain, product fit, competitive difficulty, and the practical ease of entering the market." demo={plan.isDemo} /><section className="formula-card"><span>MARKET PRIORITY SCORE</span><div><b>30%</b> Product fit <i>+</i> <b>25%</b> Pain severity <i>+</i> <b>25%</b> Revenue potential <i>+</i> <b>20%</b> Ease of entry <i>−</i> <b>10%</b> Competitive difficulty</div><p>All inputs are scored on a 0–100 scale. The result is directional strategy, not verified market research.</p></section><section className="workspace-card table-card"><div className="card-heading"><div><span>SEGMENT COMPARISON</span><h2>Market priority model</h2></div></div><div className="data-table market-table"><div className="table-head"><span>Priority / segment</span><span>Accounts</span><span>Opportunity</span><span>Pain</span><span>Fit</span><span>Competition</span><span>Deal size</span><span>Cycle</span><span>Score</span></div>{plan.segments.map((segment, index) => <div className="table-row" key={segment.name}><div className="primary-cell"><b>0{index + 1}</b><div><strong>{segment.name}</strong><small>{segment.rationale}</small></div></div><span>{segment.companies}</span><span>{segment.opportunity}</span><span>{segment.pain}</span><span>{segment.fit}</span><span>{segment.competition}</span><span>{money(segment.dealSize)}</span><span>{segment.salesCycle}d</span><Score value={segment.score} size="small" /></div>)}</div></section></>;
}

function ICP({ plan }: { plan: GTMPlan }) {
  const [persona, setPersona] = useState<Persona>(plan.personas[0]);
  return <><PageTitle eyebrow="Ideal customer profile" title="Define fit before sales starts searching." description="The ICP establishes which accounts can realize meaningful value—and gives sales a consistent way to qualify or disqualify them." demo={plan.isDemo} /><div className="fit-grid"><section className="fit-card strong"><span>Strong fit</span><b>Prioritize</b><ul>{plan.icp.strong.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="fit-card moderate"><span>Moderate fit</span><b>Validate</b><ul>{plan.icp.moderate.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="fit-card weak"><span>Weak fit</span><b>Deprioritize</b><ul>{plan.icp.weak.map((item) => <li key={item}>{item}</li>)}</ul></section></div><section className="workspace-card persona-workspace"><div className="card-heading"><div><span>BUYING COMMITTEE</span><h2>Persona strategy</h2></div></div><div className="persona-layout"><div className="persona-tabs">{plan.personas.map((item) => <button className={persona.role === item.role ? "active" : ""} onClick={() => setPersona(item)} key={item.role}><small>{item.buyingRole}</small><strong>{item.role}</strong><span>{item.influence} influence</span></button>)}</div><div className="persona-detail"><div className="persona-hero"><div><span>{persona.buyingRole}</span><h3>{persona.role}</h3></div><p>{persona.angle}</p></div><div className="persona-columns"><div><h4>Responsibilities</h4><ul>{persona.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul><h4>Key metrics</h4><div className="tag-list">{persona.kpis.map((item) => <span key={item}>{item}</span>)}</div></div><div><h4>Pain points</h4><ul>{persona.pains.map((item) => <li key={item}>{item}</li>)}</ul><h4>Buying motivations</h4><ul>{persona.motivations.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h4>Success criteria</h4><p>{persona.success}</p><h4>Common objection</h4><p>{persona.objection}</p></div></div></div></div></section></>;
}

function AccountFilters({ search, setSearch, industry, setIndustry, stage, setStage, industries }: { search: string; setSearch: (v: string) => void; industry: string; setIndustry: (v: string) => void; stage: string; setStage: (v: string) => void; industries: string[] }) {
  return <div className="filter-bar"><label className="search-field"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts" /></label><select value={industry} onChange={(e) => setIndustry(e.target.value)}><option value="">All industries</option>{industries.map((value) => <option key={value}>{value}</option>)}</select><select value={stage} onChange={(e) => setStage(e.target.value)}><option value="">All stages</option>{stages.map((value) => <option key={value}>{value}</option>)}</select></div>;
}

function Accounts({ plan, openAccount }: { plan: GTMPlan; openAccount: (account: Account) => void }) {
  const [search, setSearch] = useState(""); const [industry, setIndustry] = useState(""); const [stage, setStage] = useState("");
  const industries = [...new Set(plan.accounts.map((account) => account.industry))];
  const filtered = plan.accounts.filter((account) => account.company.toLowerCase().includes(search.toLowerCase()) && (!industry || account.industry === industry) && (!stage || account.stage === stage));
  const fields = plan.accountFields ?? { entityLabel: "Company", valueLabel: "Revenue", scaleLabel: "Facilities" };
  return <><PageTitle eyebrow="Target account workspace" title="Turn the ICP into a workable account list." description="Search, filter, and inspect the prospects that best match the strategy. Custom-project names, signals, and metrics are fictional simulation data." demo={plan.isDemo} /><section className="workspace-card table-card"><AccountFilters search={search} setSearch={setSearch} industry={industry} setIndustry={setIndustry} stage={stage} setStage={setStage} industries={industries} /><div className="table-meta"><span>{countLabel(filtered.length, fields.entityLabel.toLowerCase())}</span><small>Sorted by opportunity score · generated names are fictional</small></div><div className="data-table accounts-table"><div className="table-head"><span>{fields.entityLabel}</span><span>Segment</span><span>{fields.valueLabel}</span><span>{fields.scaleLabel}</span><span>Target buyer</span><span>ICP fit</span><span>Intent</span><span>Opportunity</span><span>Value</span><span>Stage</span></div>{filtered.map((account) => <button className="table-row clickable" onClick={() => openAccount(account)} key={account.id}><div className="company-cell"><i>{account.company.charAt(0)}</i><div><strong>{account.company}</strong><small>{account.fictional ? "Fictional prospect" : account.lastActivity}</small></div></div><span>{account.industry}</span><span>{account.revenue}</span><span>{accountScale(account)}</span><span>{account.buyer}</span><Score value={account.fitScore} size="small" /><Score value={account.intentScore} size="small" /><Score value={account.opportunityScore} size="small" /><strong>{money(account.dealValue)}</strong><span className={`stage-pill stage-${account.stage.toLowerCase().replace(" ", "-")}`}>{account.stage}</span></button>)}</div>{!filtered.length && <div className="empty-state"><b>No prospects match those filters.</b><span>Try a broader segment, stage, or name search.</span></div>}</section></>;
}

function PriorityAccounts({ plan, openAccount }: { plan: GTMPlan; openAccount: (account: Account) => void }) {
  return <><PageTitle eyebrow="Sales engine" title="Your next 90 minutes, prioritized." description="Opportunity Score combines ICP fit, buying intent, engagement, deal potential, timing, and buyer access so the reason behind every rank is visible." demo={plan.isDemo} /><section className="formula-card opportunity-formula"><span>OPPORTUNITY SCORE</span><div><b>40%</b> ICP fit <i>+</i> <b>25%</b> Intent <i>+</i> <b>15%</b> Engagement <i>+</i> <b>10%</b> Deal value <i>+</i> <b>5%</b> Timing <i>+</i> <b>5%</b> Buyer access</div></section><div className="priority-stack">{plan.accounts.slice(0, 8).map((account, index) => <article className="priority-account" key={account.id}><div className="priority-rank"><span>Priority</span><b>{String(index + 1).padStart(2, "0")}</b></div><div className="priority-main"><div className="priority-company"><div><span>{account.industry}</span><h2>{account.company}</h2><p>{account.priorityReason}</p></div><Score value={account.opportunityScore} size="large" /></div><div className="priority-scores"><span>ICP fit <b>{account.fitScore}</b></span><span>Intent <b>{account.intentScore}</b></span><span>Engagement <b>{account.engagement}</b></span><span>Est. value <b>{money(account.dealValue)}</b></span><span>Target buyer <b>{account.buyer}</b></span></div><div className="priority-actions"><div><small>OUTREACH ANGLE</small><p>{account.outreachAngle}</p></div><div><small>NEXT ACTION</small><p>{account.nextAction}</p></div><button onClick={() => openAccount(account)}>Open account brief →</button></div></div></article>)}</div></>;
}

function Pipeline({ plan, moveStage }: { plan: GTMPlan; moveStage: (account: Account) => void }) {
  const metrics = planMetrics(plan.accounts); const activeStages = stages.filter((stage) => stage !== "Closed Won");
  return <><PageTitle eyebrow="Revenue execution" title="See how target accounts become revenue." description="Move an opportunity forward to update its stage probability, weighted value, and the overall simulated pipeline." demo={plan.isDemo} /><div className="metric-grid compact"><MetricCard label="Total pipeline" value={money(metrics.pipeline)} detail="Open opportunity value" featured /><MetricCard label="Weighted pipeline" value={money(metrics.weighted)} detail="Probability adjusted" /><MetricCard label="Average deal" value={money(metrics.averageDeal)} detail="Across active opportunities" /><MetricCard label="Coverage" value={`${metrics.coverage.toFixed(1)}×`} detail="Target benchmark: 3.0×" /></div><div className="pipeline-board">{activeStages.map((stage) => { const accounts = plan.accounts.filter((account) => account.stage === stage); const value = accounts.reduce((sum, account) => sum + account.dealValue, 0); return <section className="pipeline-column" key={stage}><header><div><strong>{stage}</strong><span>{STAGE_PROBABILITY[stage]}% probability</span></div><b>{accounts.length}</b><small>{money(value)}</small></header><div>{accounts.slice(0, 4).map((account) => <article key={account.id}><div><strong>{account.company}</strong><Score value={account.opportunityScore} size="small" /></div><span>{account.buyer}</span><b>{money(account.dealValue)}</b><button onClick={() => moveStage(account)} disabled={stage === "Evaluation"}>Advance stage →</button></article>)}{!accounts.length && <div className="column-empty">No accounts</div>}</div></section>; })}</div><div className="flow-caption"><span>Identify</span><i>→</i><span>Prioritize</span><i>→</i><span>Research</span><i>→</i><span>Contact</span><i>→</i><span>Qualify</span><i>→</i><span>Progress</span><i>→</i><span>Close</span></div></>;
}

function Campaigns({ plan }: { plan: GTMPlan }) {
  const ranked = [...plan.campaigns].sort((a, b) => campaignMetrics(b).efficiency - campaignMetrics(a).efficiency);
  const cheapest = [...plan.campaigns].sort((a, b) => campaignMetrics(a).cpl - campaignMetrics(b).cpl)[0];
  const maxPipeline = Math.max(...plan.campaigns.map((campaign) => campaign.pipeline));
  return <><PageTitle eyebrow="Demand to revenue" title="Judge campaigns by pipeline, not applause." description="Cheap leads can conceal weak revenue performance. This view connects spend and engagement to meetings, opportunities, pipeline, and revenue." demo={plan.isDemo} /><div className="dashboard-grid campaign-summary"><section className="workspace-card dark-card"><div className="card-heading"><div><span>BEST PIPELINE SOURCE</span><h2>{ranked[0].name}</h2></div></div><strong className="big-number">{campaignMetrics(ranked[0]).efficiency.toFixed(1)}×</strong><p>Pipeline generated per dollar spent</p></section><section className="workspace-card"><div className="card-heading"><div><span>BUDGET SIGNAL</span><h2>Reallocate toward revenue efficiency.</h2></div></div><p className="analysis-copy">{cheapest.name} produces the cheapest simulated leads, but {ranked[0].name} creates the strongest pipeline per dollar. Shift 15% of broad volume spend toward the higher-intent program and measure qualified pipeline—not lead count.</p></section></div><section className="workspace-card campaign-chart"><div className="card-heading"><div><span>PIPELINE BY CAMPAIGN</span><h2>High lead volume ≠ GTM success</h2></div></div>{plan.campaigns.map((campaign) => <div className="campaign-bar" key={campaign.name}><div><strong>{campaign.name}</strong><span>{campaign.channel}</span></div><i><em style={{ width: `${(campaign.pipeline / maxPipeline) * 100}%` }} /></i><b>{money(campaign.pipeline)}</b></div>)}</section><section className="workspace-card table-card"><div className="data-table campaign-table"><div className="table-head"><span>Campaign</span><span>Spend</span><span>Leads</span><span>MQLs</span><span>Meetings</span><span>Opps</span><span>Pipeline</span><span>CPL</span><span>ROAS</span><span>Efficiency</span></div>{plan.campaigns.map((campaign) => { const metrics = campaignMetrics(campaign); return <div className="table-row" key={campaign.name}><div className="primary-cell"><div><strong>{campaign.name}</strong><small>{campaign.channel}</small></div></div><span>{money(campaign.spend)}</span><span>{campaign.leads}</span><span>{campaign.mqls}</span><span>{campaign.meetings}</span><span>{campaign.opportunities}</span><strong>{money(campaign.pipeline)}</strong><span>{money(metrics.cpl)}</span><span>{metrics.roas.toFixed(1)}×</span><span>{metrics.efficiency.toFixed(1)}×</span></div>; })}</div></section></>;
}

function Messaging({ plan }: { plan: GTMPlan }) {
  const [persona, setPersona] = useState(plan.personas[0]);
  return <><PageTitle eyebrow="Positioning & messaging" title="Translate strategy into buyer language." description="The message changes with the buyer’s responsibility and risk, while the underlying value proposition stays consistent." demo={plan.isDemo} /><section className="positioning-card"><span>POSITIONING STATEMENT</span><blockquote>{plan.positioning}</blockquote><div><small>CORE VALUE PROPOSITION</small><strong>{plan.valueProposition}</strong></div></section><div className="dashboard-grid equal"><section className="workspace-card"><div className="card-heading"><div><span>CUSTOMER PAIN</span><h2>What creates urgency</h2></div></div><ul className="numbered-list">{plan.messaging.painPoints.map((item, index) => <li key={item}><b>0{index + 1}</b><span>{item}</span></li>)}</ul></section><section className="workspace-card"><div className="card-heading"><div><span>ILLUSTRATIVE PROOF</span><h2>Claims to validate</h2></div></div><ul className="proof-list">{plan.messaging.proofPoints.map((item) => <li key={item}>{item}</li>)}</ul></section></div><section className="workspace-card"><div className="card-heading"><div><span>PERSONA MESSAGING</span><h2>Adapt the angle, not the promise</h2></div></div><div className="horizontal-tabs">{plan.personas.map((item) => <button className={persona.role === item.role ? "active" : ""} onClick={() => setPersona(item)} key={item.role}>{item.buyingRole}</button>)}</div><div className="message-angle"><div><span>{persona.role}</span><h3>{persona.angle}</h3></div><div><small>LIKELY OBJECTION</small><p>{persona.objection}</p></div></div></section><section className="workspace-card outreach-library"><div className="card-heading"><div><span>OUTREACH LIBRARY</span><h2>Concise, specific, useful</h2></div></div><div className="outreach-grid"><div><small>COLD EMAIL</small><p>{plan.messaging.coldEmail}</p></div><div><small>LINKEDIN MESSAGE</small><p>{plan.messaging.linkedIn}</p><small>CALL OPENER</small><p>{plan.messaging.callOpener}</p></div></div><div className="discovery-block"><small>DISCOVERY QUESTIONS</small><ol>{plan.messaging.discoveryQuestions.map((item) => <li key={item}>{item}</li>)}</ol></div><div className="objection-grid">{plan.messaging.objections.map((item) => <div key={item.objection}><strong>{item.objection}</strong><p>{item.response}</p></div>)}</div></section></>;
}

function Insights({ plan, setView }: { plan: GTMPlan; setView: (view: View) => void }) {
  const experiment = plan.nextExperiment ?? { title: "Test a trigger-led priority-account sprint.", description: "Select 20 high-fit prospects with recent buying signals. Run a two-persona sequence for 14 days, then compare meetings and qualified pipeline with the baseline motion." };
  return <><PageTitle eyebrow="Strategic intelligence" title="What the GTM team should do next." description="Each recommendation connects an observed pattern to its business implication and a specific action the team can take." demo={plan.isDemo} /><div className="insight-summary"><div><span>EXECUTIVE READOUT</span><h2>Focus beats volume.</h2></div><p>The model favors higher-fit segments, champion-led sales motions, and channels that create qualified pipeline—not simply the lowest-cost leads.</p></div><div className="insight-list">{plan.insights.map((insight, index) => <article key={insight.finding}><div className="insight-number">0{index + 1}</div><div className="insight-body"><span className={`impact ${insight.impact.toLowerCase()}`}>{insight.impact} impact</span><div><small>FINDING</small><h2>{insight.finding}</h2></div><div className="insight-columns"><div><small>WHY IT MATTERS</small><p>{insight.why}</p></div><div><small>RECOMMENDED ACTION</small><p>{insight.action}</p></div></div></div></article>)}</div><section className="next-experiment"><div><span>NEXT GTM EXPERIMENT</span><h2>{experiment.title}</h2><p>{experiment.description}</p></div><button onClick={() => setView("Priority Accounts")}>Open priority accounts →</button></section></>;
}

function AccountBrief({ account, plan, close }: { account: Account; plan: GTMPlan; close: () => void }) {
  const [tab, setTab] = useState<"brief" | "outreach" | "activity">("brief");
  const dialogRef = useDialogFocus(close);
  const scaleLabel = account.scaleLabel ?? plan.accountFields?.scaleLabel ?? "Facilities";
  const email = `Hi — I noticed ${account.triggers[0].toLowerCase()} at ${account.company}. ${plan.input.company} helps teams like yours ${plan.valueProposition.toLowerCase().replace(/^help\s+[^ ]+\s+/, "")}. Would it be useful to compare that with how your team currently manages ${account.painPoints[0].toLowerCase()}?`;
  return <div className="drawer-backdrop" onMouseDown={close}><aside ref={dialogRef} className="account-drawer" role="dialog" aria-modal="true" aria-labelledby="account-brief-title" onMouseDown={(e) => e.stopPropagation()}><header><div><span>ACCOUNT INTELLIGENCE · {account.fictional ? "FICTIONAL PROSPECT" : "ILLUSTRATIVE"}</span><h2 id="account-brief-title">{account.company}</h2><p>{account.industry} · {account.revenue} · {scaleLabel}: {accountScale(account)}</p></div><button onClick={close} aria-label="Close account brief">×</button></header><div className="drawer-tabs" role="tablist" aria-label="Account intelligence views"><button role="tab" aria-selected={tab === "brief"} className={tab === "brief" ? "active" : ""} onClick={() => setTab("brief")}>Account brief</button><button role="tab" aria-selected={tab === "outreach"} className={tab === "outreach" ? "active" : ""} onClick={() => setTab("outreach")}>Outreach assistant</button><button role="tab" aria-selected={tab === "activity"} className={tab === "activity" ? "active" : ""} onClick={() => setTab("activity")}>Activity timeline</button></div><div className="drawer-body">{tab === "brief" && <><div className="brief-score-grid"><div><small>Opportunity</small><Score value={account.opportunityScore} size="large" /></div><div><small>ICP fit</small><strong>{account.fitScore}</strong></div><div><small>Intent</small><strong>{account.intentScore}</strong></div><div><small>Est. value</small><strong>{money(account.dealValue)}</strong></div></div><section><small>WHY THIS PROSPECT FITS</small><p>{account.priorityReason}</p></section><div className="brief-columns"><section><small>LIKELY PAIN POINTS</small><ul>{account.painPoints.map((item) => <li key={item}>{item}</li>)}</ul></section><section><small>BUYING TRIGGERS</small><ul>{account.triggers.map((item) => <li key={item}>{item}</li>)}</ul></section></div><section><small>BUYER MAP</small><div className="buyer-map">{Object.entries(account.buyerMap).map(([role, buyer]) => <div key={role}><span>{role.replace(/([A-Z])/g, " $1")}</span><strong>{buyer}</strong></div>)}</div></section><section className="opportunity-panel"><div><small>CURRENT OPPORTUNITY</small><h3>{account.stage} · {account.probability}% probability</h3><p>Main use case: {account.mainUseCase ?? plan.valueProposition}</p></div><strong>{money(account.dealValue)}</strong></section><section className="next-action-callout"><small>RECOMMENDED NEXT ACTION</small><p>{account.nextAction}</p></section></>}{tab === "outreach" && <><section><small>PERSONALIZED COLD EMAIL</small><p className="copy-block">{email}</p></section><section><small>LINKEDIN MESSAGE</small><p className="copy-block">Noticed {account.triggers[0].toLowerCase()} at {account.company}. {account.outreachAngle} Thought the connection could be timely.</p></section><section><small>CALL OPENER</small><p className="copy-block">I’m calling because {account.industry.toLowerCase()} teams often struggle because {account.painPoints[0].toLowerCase()}. How is your team handling that today?</p></section><section><small>DISCOVERY QUESTIONS</small><ol>{plan.messaging.discoveryQuestions.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ol></section><section><small>LIKELY OBJECTION & RESPONSE</small><div className="objection-card"><strong>{plan.messaging.objections[0].objection}</strong><p>{plan.messaging.objections[0].response}</p></div></section><section><small>FOLLOW-UP SUGGESTION</small><p>{account.followUp ?? "Send a one-page business-case hypothesis within 24 hours, then invite the champion to a focused working session."}</p></section></>}{tab === "activity" && <div className="timeline"><div className="timeline-legend"><span className="marketing">Marketing</span><span className="sales">Sales</span><span className="opportunity">Opportunity</span></div>{account.timeline.map((item) => <div className={`timeline-item ${item.type}`} key={`${item.date}-${item.event}`}><span>{item.date}</span><i /><p>{item.event}</p></div>)}</div>}</div></aside></div>;
}

function Projects({ projects, onOpen, onDelete, onNew, onHome }: { projects: GTMPlan[]; onOpen: (plan: GTMPlan) => void; onDelete: (id: string) => void; onNew: () => void; onHome: () => void }) {
  return <main className="projects-page"><header><div className="projects-header-left"><Logo /><button className="home-button home-button-dark back-home-button" onClick={onHome} aria-label="Return to GTM Lab home"><span aria-hidden="true">←</span>Home</button></div><button className="primary-small" onClick={onNew}>+ New GTM project</button></header><section><span className="page-kicker">PROJECT HISTORY</span><h1>Your GTM workspaces</h1><p>Local to this browser. Generated analysis and all quantitative metrics are illustrative.</p><div className="project-card-grid"><article className="project-history-card demo-project"><div className="project-card-top"><span className="project-initial">S</span><TrustBadge demo /></div><h2>Sentinel AI</h2><p>AI-powered predictive maintenance software</p><dl><div><dt>Top segment</dt><dd>Automotive manufacturing</dd></div><div><dt>Target accounts</dt><dd>25</dd></div><div><dt>Pipeline estimate</dt><dd>{money(planMetrics(sentinelPlan.accounts).pipeline)}</dd></div></dl><button onClick={() => onOpen(sentinelPlan)}>Open demo →</button></article>{projects.map((plan) => <article className="project-history-card" key={plan.id}><div className="project-card-top"><span className="project-initial">{plan.input.company.charAt(0)}</span><span className="created-date">{new Date(plan.createdAt).toLocaleDateString()}</span></div><h2>{plan.input.company}</h2><p>{plan.input.product}</p><dl><div><dt>Top segment</dt><dd>{plan.segments[0].name}</dd></div><div><dt>Target accounts</dt><dd>{plan.accounts.length}</dd></div><div><dt>Pipeline estimate</dt><dd>{money(planMetrics(plan.accounts).pipeline)}</dd></div></dl><div className="project-actions"><button onClick={() => onOpen(plan)}>Open project →</button><button className="delete-button" onClick={() => onDelete(plan.id)}>Delete</button></div></article>)}</div></section></main>;
}

function Generating({ step }: { step: number }) {
  return <div className="generation-screen"><div className="generation-card"><div className="generation-mark">G</div><span>BUILDING YOUR GTM WORKSPACE</span><h1>{generationSteps[step]}</h1><p>Connecting market strategy, account prioritization, pipeline, and revenue logic.</p><div className="generation-progress"><i style={{ width: `${((step + 1) / generationSteps.length) * 100}%` }} /></div><div className="generation-steps">{generationSteps.map((item, index) => <span className={index < step ? "done" : index === step ? "active" : ""} key={item}>{index < step ? "✓" : String(index + 1).padStart(2, "0")} {item}</span>)}</div><small>Generated analysis and quantitative outputs will be labeled as illustrative.</small></div></div>;
}

function DataProvenance({ plan, close }: { plan: GTMPlan; close: () => void }) {
  const dialogRef = useDialogFocus(close);
  const strategySource = plan.generationMode === "ai" ? "a server-side AI model using structured output" : "the prototype’s built-in illustrative strategy logic";
  return <div className="provenance-backdrop"><button className="provenance-dismiss" onClick={close} aria-label="Close data explanation" /><section ref={dialogRef} className="provenance-modal" role="dialog" aria-modal="true" aria-labelledby="provenance-title"><header><div><span>DATA PROVENANCE</span><h2 id="provenance-title">What is real—and what is modeled?</h2></div><button onClick={close} aria-label="Close data explanation">×</button></header><div className="provenance-callout"><i />{plan.isDemo ? <p><strong>Sentinel AI is a fictional demo company.</strong> Every fact, account, signal, and metric in this workspace is illustrative.</p> : <p><strong>This is a prototype scenario for {plan.input.company}.</strong> GTM Lab did not research the company or retrieve private operating data.</p>}</div><div className="provenance-grid"><article><span className="source-dot user-source" /><small>FROM YOU</small><h3>User-provided context</h3><dl><div><dt>Company</dt><dd>{plan.input.company}</dd></div><div><dt>Product</dt><dd>{plan.input.product}</dd></div><div><dt>Market</dt><dd>{plan.input.targetMarket}</dd></div><div><dt>Geography</dt><dd>{plan.input.geography}</dd></div><div><dt>Goal</dt><dd>{plan.input.goal}</dd></div></dl></article><article><span className="source-dot generated-source" /><small>GENERATED</small><h3>Strategy hypotheses</h3><p>Market segments, ICP, personas, positioning, messaging, outreach, and recommendations were produced from your inputs by {strategySource}.</p></article><article><span className="source-dot simulated-source" /><small>SIMULATED</small><h3>Illustrative operating data</h3><p>Fictional prospects, intent signals, engagement, scores, campaign performance, pipeline, conversion, and revenue are calculated scenario data.</p></article><article className="research-status"><span className="source-dot research-source" /><small>EXTERNAL RESEARCH</small><h3>Not performed in V1</h3><p>No company website, public filing, news source, CRM, intent provider, or enrichment database was queried.</p></article></div><footer><p>Use this workspace to evaluate the GTM framework—not as verified company intelligence.</p><button onClick={close}>I understand — enter workspace</button></footer></section></div>;
}

export default function GtmApp() {
  const [screen, setScreen] = useState<"landing" | "workspace" | "projects" | "generating">("landing");
  const [view, setView] = useState<View>("Overview");
  const [plan, setPlan] = useState<GTMPlan>(sentinelPlan);
  const [projects, setProjects] = useState<GTMPlan[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [generationStep, setGenerationStep] = useState(0);
  const [mobileNav, setMobileNav] = useState(false);
  const [showProvenance, setShowProvenance] = useState(false);
  const [draft, setDraft] = useState<GTMInput>(emptyInput);
  const [generationError, setGenerationError] = useState("");
  const generatingRef = useRef(false);

  useEffect(() => {
    try {
      setProjects(loadSavedProjects(window.localStorage.getItem("gtm-lab-projects")));
    } catch { /* local storage may be unavailable */ }
  }, []);

  const persist = (next: GTMPlan[]) => { setProjects(next); try { localStorage.setItem("gtm-lab-projects", JSON.stringify(next)); } catch { /* local storage may be unavailable */ } };
  const openPlan = (next: GTMPlan) => { setPlan(next); setView("Overview"); setScreen("workspace"); window.scrollTo(0, 0); };
  const generate = async (input: GTMInput) => {
    if (generatingRef.current) return;
    generatingRef.current = true; setGenerationError(""); setScreen("generating"); setGenerationStep(0);
    try {
      const next = await generateGTMPlan(input, "api", setGenerationStep);
      persist([next, ...projects.filter((project) => project.id !== next.id)].slice(0, 8));
      openPlan(next);
      setShowProvenance(true);
    } catch { setGenerationError("GTM Lab could not finish that workspace."); setScreen("landing"); }
    finally { generatingRef.current = false; }
  };
  const moveStage = (account: Account) => {
    const index = stages.indexOf(account.stage); if (index < 0 || index >= stages.length - 2) return;
    const stage = stages[index + 1]; const probability = STAGE_PROBABILITY[stage];
    const updatedAccounts = plan.accounts.map((item) => item.id === account.id ? { ...item, stage, probability, opportunityScore: calculateOpportunityScore(item) } : item);
    const updated = { ...plan, accounts: updatedAccounts }; setPlan(updated);
    if (!plan.isDemo) persist(projects.map((project) => project.id === plan.id ? updated : project));
  };
  const deleteProject = (id: string) => persist(projects.filter((project) => project.id !== id));

  if (screen === "generating") return <Generating step={generationStep} />;
  if (screen === "projects") return <Projects projects={projects} onOpen={openPlan} onDelete={deleteProject} onNew={() => setScreen("landing")} onHome={() => setScreen("landing")} />;
  if (screen === "landing") return <Landing input={draft} setInput={setDraft} generationError={generationError} onDemo={() => openPlan(sentinelPlan)} onGenerate={generate} onProjects={() => setScreen("projects")} hasProjects={projects.length > 0} />;

  return <div className="app-shell">
    <aside className={`main-sidebar ${mobileNav ? "open" : ""}`} aria-label="Workspace navigation"><div className="sidebar-top"><Logo /><button className="mobile-close" onClick={() => setMobileNav(false)} aria-label="Close navigation">×</button></div><button className="project-switcher" onClick={() => setScreen("projects")}><i>{plan.input.company.charAt(0)}</i><div><small>{plan.isDemo ? "Demo project" : "Current project"}</small><strong>{plan.input.company}</strong></div><span>⌄</span></button><button className="new-project-button" onClick={() => setScreen("landing")}>+ New GTM project</button><nav aria-label="GTM workspace sections">{views.map((item, index) => <button className={view === item ? "active" : ""} aria-current={view === item ? "page" : undefined} onClick={() => { setView(item); setMobileNav(false); }} key={item}><i>{String(index + 1).padStart(2, "0")}</i><span>{item}</span>{item === "Insights" && <b>4</b>}</button>)}</nav><div className="sidebar-method"><small>THE GTM SYSTEM</small><p>Market → ICP → Accounts → Pipeline → Revenue</p><button onClick={() => setScreen("landing")}>About the methodology</button></div></aside>
    <div className="app-main"><header className="app-topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation" aria-expanded={mobileNav}>☰</button><div className="breadcrumb"><span>{plan.input.company}</span><i>/</i><b>{view}</b></div><div className="topbar-actions"><span className="data-note">{plan.generationMode === "ai" ? "AI strategy · simulated operating data" : "Illustrative model — not verified company data"}</span><button className="home-button" onClick={() => setScreen("landing")} aria-label="Return to GTM Lab home"><span aria-hidden="true">⌂</span>Home</button><button className="source-button" onClick={() => setShowProvenance(true)}><i />Data sources</button><button onClick={() => setScreen("projects")}>Projects</button></div></header><main className="workspace-content">{view === "Overview" && <Overview plan={plan} setView={setView} />}{view === "Market" && <Market plan={plan} />}{view === "ICP" && <ICP plan={plan} />}{view === "Accounts" && <Accounts plan={plan} openAccount={setSelectedAccount} />}{view === "Priority Accounts" && <PriorityAccounts plan={plan} openAccount={setSelectedAccount} />}{view === "Pipeline" && <Pipeline plan={plan} moveStage={moveStage} />}{view === "Campaigns" && <Campaigns plan={plan} />}{view === "Messaging" && <Messaging plan={plan} />}{view === "Insights" && <Insights plan={plan} setView={setView} />}</main></div>
    {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    {selectedAccount && <AccountBrief account={selectedAccount} plan={plan} close={() => setSelectedAccount(null)} />}
    {showProvenance && <DataProvenance plan={plan} close={() => setShowProvenance(false)} />}
  </div>;
}
