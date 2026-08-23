import { validateStrategyHypothesis } from "./generator";
import type { GTMInput, StrategyHypothesis } from "./types";

const stringArray = { type: "array", minItems: 3, items: { type: "string", minLength: 3 } } as const;

const strategySchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "valueProposition", "positioning", "segments", "icp", "personas", "messaging", "campaigns", "recommendations", "insights", "marketIndustries", "buyingSignals", "accountPainPoints", "accountTriggers", "mainUseCase", "followUp", "nextExperiment"],
  properties: {
    summary: { type: "string", minLength: 40 },
    valueProposition: { type: "string", minLength: 25 },
    positioning: { type: "string", minLength: 40 },
    segments: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["name", "rationale"], properties: { name: { type: "string" }, rationale: { type: "string" } } } },
    icp: { type: "object", additionalProperties: false, required: ["strong", "moderate", "weak"], properties: { strong: stringArray, moderate: stringArray, weak: stringArray } },
    personas: { type: "array", minItems: 4, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["role", "buyingRole", "responsibilities", "kpis", "pains", "motivations", "success", "objection", "angle", "influence"], properties: { role: { type: "string" }, buyingRole: { type: "string", enum: ["Economic buyer", "Champion", "Technical evaluator", "End user", "Potential blocker"] }, responsibilities: stringArray, kpis: stringArray, pains: stringArray, motivations: stringArray, success: { type: "string" }, objection: { type: "string" }, angle: { type: "string" }, influence: { type: "string", enum: ["High", "Medium"] } } } },
    messaging: { type: "object", additionalProperties: false, required: ["painPoints", "proofPoints", "coldEmail", "linkedIn", "callOpener", "elevatorPitch", "discoveryQuestions", "objections"], properties: { painPoints: stringArray, proofPoints: stringArray, coldEmail: { type: "string" }, linkedIn: { type: "string" }, callOpener: { type: "string" }, elevatorPitch: { type: "string" }, discoveryQuestions: { type: "array", minItems: 5, items: { type: "string" } }, objections: { type: "array", minItems: 3, items: { type: "object", additionalProperties: false, required: ["objection", "response"], properties: { objection: { type: "string" }, response: { type: "string" } } } } } },
    campaigns: { type: "array", minItems: 5, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["name", "channel"], properties: { name: { type: "string" }, channel: { type: "string" } } } },
    recommendations: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } },
    insights: { type: "array", minItems: 0, items: { type: "object", additionalProperties: false, required: ["finding", "why", "action", "impact"], properties: { finding: { type: "string" }, why: { type: "string" }, action: { type: "string" }, impact: { type: "string", enum: ["High", "Medium"] } } } },
    marketIndustries: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } },
    buyingSignals: { type: "array", minItems: 5, items: { type: "string" } },
    accountPainPoints: stringArray,
    accountTriggers: { type: "array", minItems: 4, items: { type: "string" } },
    mainUseCase: { type: "string", minLength: 25 },
    followUp: { type: "string", minLength: 25 },
    nextExperiment: { type: "object", additionalProperties: false, required: ["title", "description"], properties: { title: { type: "string" }, description: { type: "string" } } },
  },
} as const;

function outputText(response: unknown) {
  if (!response || typeof response !== "object") return null;
  const output = (response as { output?: unknown[] }).output;
  if (!Array.isArray(output)) return null;
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown[] }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (part && typeof part === "object" && (part as { type?: string }).type === "output_text" && typeof (part as { text?: unknown }).text === "string") return (part as { text: string }).text;
    }
  }
  return null;
}

export async function generateAIStrategy(input: GTMInput, apiKey: string, model = "gpt-5-mini"): Promise<StrategyHypothesis> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        instructions: "You are a rigorous go-to-market strategist. Build one internally consistent strategy only from the user-provided context. Do not claim to research the website or know private company data. Segments must be meaningfully different. Use concise, specific language and industry-appropriate personas, pains, signals, campaigns, and account criteria. All proof points must begin with 'Illustrative hypothesis:'. Never reuse manufacturing, equipment, facility, downtime, automotive, maintenance, or Reliability Director language unless the product and target market are genuinely industrial. Do not invent real target-account company names; accounts and quantitative simulation are created separately by deterministic application logic.",
        input: JSON.stringify(input),
        text: { format: { type: "json_schema", name: "gtm_strategy", strict: true, schema: strategySchema } },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI request failed with ${response.status}.`);
    const text = outputText(await response.json());
    if (!text) throw new Error("OpenAI response did not contain structured output.");
    const parsed = JSON.parse(text) as unknown;
    if (!validateStrategyHypothesis(parsed)) throw new Error("OpenAI strategy failed validation.");
    return parsed;
  } finally { clearTimeout(timeout); }
}
