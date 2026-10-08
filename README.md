# GTM Lab

GTM Lab is a recruiter-facing, interactive go-to-market strategy and revenue planning workspace. It models the connected path from market selection and ICP design through account prioritization, outreach, pipeline, campaign economics, and strategic next actions.

## V1 behavior

- Four public researched demos are available: Out2Win, Nike, Decagon and Anduril. Sentinel and ForecastFlow are retained as internal test fixtures and excluded from public demo choices.
- A curated Out2Win research workspace is available at `/out2win`, from the homepage and My Projects. It uses first-party sources reviewed October 6, 2026, not the mock generator.
- The strategy form creates industry-aware workspaces from one connected strategy object.
- When configured, qualitative strategy is generated through a server-side OpenAI Responses API call with strict structured output.
- Without an API key—or if an AI request fails—the validated deterministic illustrative generator keeps the complete experience working.
- Generated projects are stored only in the browser with `localStorage`.
- Pipeline, intent, campaign, and revenue figures are explicitly labeled as simulated or illustrative.
- Account and market scores use visible weighted formulas in `lib/scoring.ts`.
- The project-generation boundary is `generateGTMPlan(input)` in `lib/generator.ts`.
- `POST /api/generate` validates input, limits request size, applies lightweight per-instance rate limiting, and returns structured JSON.

## Optional AI setup

1. Copy `.env.example` to `.env.local`.
2. Add an OpenAI API key as `OPENAI_API_KEY`. Never use a `NEXT_PUBLIC_` prefix.
3. Optionally set `OPENAI_MODEL`; the default is `gpt-5-mini`.
4. Restart the local development server.

The API call runs only in `POST /api/generate`. It requests structured qualitative strategy, validates it, and then lets deterministic application code calculate fictional prospects, scores, campaigns, pipeline, and revenue. If the request times out or fails validation, the app falls back automatically.

## Trust model

- User-entered inputs are treated as real user-provided context.
- Strategy, ICP, personas, messaging, and recommendations are generated hypotheses.
- Accounts, intent, campaign performance, pipeline, and revenue are illustrative simulation data.

### Out2Win researched case study

`lib/out2win.ts` holds the curated source register, eight real brand candidates, public evidence, proposed strategy and unsent outreach drafts. `lib/research.ts` implements a separate transparent research-priority model. `components/ResearchedWorkspace.tsx` renders the nine researched sections without using simulated operating metrics. The normal generator remains available. Sentinel stays as an internal test fixture.

Brand announcements establish relevance, not buying intent. Candidate relationships and CRM ownership must be checked before outreach. Published campaign results are attributed to Out2Win and are not independently audited. ICP, buyer roles, scores and recommendations are editorial hypotheses. Private pipeline, revenue, budgets, contact details and probabilities remain unknown. This is a dated research snapshot, not a live company-research feature.

### Nike, Decagon and Anduril researched cases

`lib/company-demos.ts` holds the source registers and tailored editorial proposals, reviewed October 8, 2026. `components/CompanyResearchWorkspace.tsx` renders the nine workspace sections at `/nike`, `/decagon` and `/anduril`. Each case contains three real organizations and two editorial priorities; no simulated financials or invented numeric scores are used.

Nike uses retail channel accounts, with consumers as the end customers. Decagon uses workflow-based research candidates whose existing vendor relationships are unknown. Anduril uses established public-program context, not asserted net-new opportunities. Source-reader limitations and publisher attribution appear in each source register. These are manual snapshots, not live external-research features. Hidden test projects remain in browser storage; the public project list filters their names without deleting saved data.

## Local development

Use the project’s existing scripts:

- `npm run dev`
- `npm run build`
- `npm test`
- `npm run lint`

Publishing local changes requires explicit approval. No development or verification script deploys the site.
