import { generateAIStrategy } from "../../../lib/ai";
import { generateMockGTMPlan, validateGTMInput } from "../../../lib/generator";
import type { GTMInput } from "../../../lib/types";

const requests = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60_000;
const MAX_REQUESTS = 6;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 16_000) return Response.json({ error: "Request is too large." }, { status: 413 });

  const client = request.headers.get("cf-connecting-ip") ?? "local";
  const now = Date.now();
  const current = requests.get(client);
  if (current && current.resetAt > now && current.count >= MAX_REQUESTS) {
    return Response.json({ error: "Generation limit reached. Try again in a minute." }, { status: 429 });
  }
  requests.set(client, current && current.resetAt > now ? { ...current, count: current.count + 1 } : { count: 1, resetAt: now + WINDOW_MS });

  try {
    const input = await request.json() as GTMInput;
    const error = validateGTMInput(input);
    if (error) return Response.json({ error }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ plan: generateMockGTMPlan(input), source: "illustrative" });

    try {
      const strategy = await generateAIStrategy(input, apiKey, process.env.OPENAI_MODEL ?? "gpt-5-mini");
      return Response.json({ plan: generateMockGTMPlan(input, strategy, "ai"), source: "ai" });
    } catch {
      return Response.json({ plan: generateMockGTMPlan(input), source: "illustrative", warning: "AI generation was unavailable, so GTM Lab used its validated illustrative strategy generator." });
    }
  } catch {
    return Response.json({ error: "Could not generate the GTM plan." }, { status: 500 });
  }
}
