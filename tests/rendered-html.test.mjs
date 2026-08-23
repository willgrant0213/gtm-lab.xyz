import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

let workerPromise;
async function worker() {
  if (!workerPromise) {
    const workerUrl = new URL("../dist/server/index.js", import.meta.url);
    workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
    workerPromise = import(workerUrl.href).then((module) => module.default);
  }
  return workerPromise;
}

const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
const ctx = { waitUntil() {}, passThroughOnException() {} };

async function render(path = "/") {
  return (await worker()).fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), env, ctx);
}

async function generate(input) {
  const response = await (await worker()).fetch(new Request("http://localhost/api/generate", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": `test-${input.company}` }, body: JSON.stringify(input) }), env, ctx);
  assert.equal(response.status, 200);
  return response.json();
}

const inputs = {
  industrial: { company: "FactorySignal", website: "factorysignal.example", product: "Predictive maintenance software for industrial equipment", targetMarket: "Industrial manufacturers", geography: "United States", goal: "Acquire mid-market customers" },
  saas: { company: "ForecastFlow", website: "forecastflow.example", product: "Revenue forecasting software", targetMarket: "B2B SaaS companies", geography: "North America", goal: "Move upmarket" },
  local: { company: "BrightBook", website: "", product: "Booking and retention service for neighborhood salons", targetMarket: "Independent local service businesses", geography: "United States", goal: "Acquire mid-market customers" },
  consumer: { company: "Everyday Club", website: "everyday.club", product: "Consumer wellness subscription", targetMarket: "Health-conscious urban consumers", geography: "United States", goal: "Launch a new product" },
};

test("server-renders the recruiter-facing GTM Lab experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>GTM Lab/);
  assert.match(html, /Turn a market thesis into a revenue plan/);
  assert.match(html, /Build a GTM strategy/);
  assert.match(html, /Explore Sentinel AI/);
  assert.match(html, /Illustrative model/);
  assert.match(html, /One connected commercial story/);
  assert.match(html, /No external company research is performed/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/);
});

test("keeps generation, scoring, AI, and UI logic separated", async () => {
  const [page, component, scoring, generator, ai, sentinel, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/GtmApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/scoring.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/generator.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/ai.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/sentinel.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(page, /<GtmApp \/>/);
  assert.match(component, /loadSavedProjects/);
  assert.match(component, /RECRUITER QUICK TOUR/);
  assert.match(component, /What is real—and what is modeled/);
  assert.match(component, /useDialogFocus/);
  assert.match(scoring, /calculateOpportunityScore/);
  assert.match(generator, /createIllustrativeStrategy/);
  assert.match(generator, /strategyHasLeakage/);
  assert.match(ai, /api\.openai\.com\/v1\/responses/);
  assert.match(ai, /json_schema/);
  assert.match(sentinel, /Magna International/);
  assert.match(layout, /\/og\.png/);
  assert.match(layout, /\/favicon\.svg/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await Promise.all([access(new URL("../public/og.png", import.meta.url)), access(new URL("../public/favicon.svg", import.meta.url)), access(new URL("../.env.example", import.meta.url))]);
});

test("custom generation adapts across industrial, SaaS, local-service, and consumer projects", async () => {
  const [industrial, saas, local, consumer] = await Promise.all(Object.values(inputs).map(generate));
  assert.equal(industrial.source, "illustrative");
  assert.equal(industrial.plan.strategyProfile, "industrial-operations");
  assert.equal(saas.plan.strategyProfile, "b2b-saas-revenue");
  assert.equal(local.plan.strategyProfile, "local-services");
  assert.equal(consumer.plan.strategyProfile, "consumer-subscription");

  const saasText = JSON.stringify(saas.plan);
  const localText = JSON.stringify(local.plan);
  const consumerText = JSON.stringify(consumer.plan);
  for (const text of [saasText, localText, consumerText]) assert.doesNotMatch(text, /Sentinel AI|Reliability Director|predictive maintenance|unplanned downtime|equipment failure|automotive manufacturing/i);
  assert.doesNotMatch(localText, /forecast accuracy|RevOps|board planning/i);
  assert.doesNotMatch(saasText, /booking workshop|neighborhood awareness|location manager/i);
  assert.match(saasText, /VP Revenue Operations|forecast confidence|B2B SaaS/);
  assert.match(localText, /Owner \/ General Manager|bookings|Locations/);
  assert.match(consumerText, /Lifecycle Marketing Lead|retention|Addressable members/);

  for (const body of [industrial, saas, local, consumer]) {
    assert.equal(new Set(body.plan.segments.map((segment) => segment.name)).size, 5);
    assert.equal(body.plan.accounts.length, 20);
    assert.ok(body.plan.accounts.every((account) => account.fictional === true));
    assert.ok(body.plan.accounts.every((account) => body.plan.personas.some((persona) => persona.role === account.buyer)));
    assert.ok(body.plan.accounts[0].opportunityScore >= body.plan.accounts[1].opportunityScore);
    assert.match(body.plan.summary.toLowerCase(), new RegExp(body.plan.segments[0].name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("scoring, pipeline arithmetic, validation, saved loading, and AI response validation are deterministic", async (t) => {
  const vite = await createServer({ configFile: false, root: fileURLToPath(new URL("..", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  t.after(() => vite.close());
  const generator = await vite.ssrLoadModule("/lib/generator.ts");
  const scoring = await vite.ssrLoadModule("/lib/scoring.ts");
  const plan = generator.generateMockGTMPlan(inputs.saas);
  const account = plan.accounts[0];
  const expectedFit = Math.round(account.fitFactors.industry * .25 + account.fitFactors.size * .2 + account.fitFactors.complexity * .25 + account.fitFactors.geography * .1 + account.fitFactors.technology * .2);
  assert.equal(account.fitScore, expectedFit);
  assert.equal(account.opportunityScore, scoring.calculateOpportunityScore(account));

  const active = plan.accounts.filter((item) => item.stage !== "Target");
  const pipeline = active.reduce((sum, item) => sum + item.dealValue, 0);
  const weighted = active.reduce((sum, item) => sum + item.dealValue * item.probability / 100, 0);
  assert.equal(scoring.planMetrics(plan.accounts).pipeline, pipeline);
  assert.equal(scoring.planMetrics(plan.accounts).weighted, weighted);

  assert.deepEqual(generator.validateGTMInputFields({ ...inputs.saas, company: "", geography: "" }), { company: "Enter a company name.", geography: "Enter a target geography." });
  assert.equal(generator.validateGTMInputFields({ ...inputs.saas, website: "forecastflow.com" }).website, undefined);
  assert.match(generator.validateGTMInputFields({ ...inputs.saas, website: "not-a-domain" }).website, /company\.com/);

  const loaded = generator.loadSavedProjects(JSON.stringify([plan, { broken: true }]));
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, plan.id);
  assert.deepEqual(generator.loadSavedProjects("bad json"), []);

  const strategy = generator.createIllustrativeStrategy(inputs.saas);
  assert.equal(generator.validateStrategyHypothesis(strategy), true);
  assert.equal(generator.validateStrategyHypothesis({ ...strategy, personas: [] }), false);
});

test("generation API reports specific validation errors", async () => {
  const response = await (await worker()).fetch(new Request("http://localhost/api/generate", { method: "POST", headers: { "content-type": "application/json", "cf-connecting-ip": "invalid-test" }, body: JSON.stringify({ ...inputs.saas, product: "" }) }), env, ctx);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /product or service/i);
});
