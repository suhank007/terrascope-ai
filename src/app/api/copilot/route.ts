import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { COPILOT_TOOLS, executeCopilotTool } from "@/features/copilot/lib/tools";
import type { CopilotChatResponse } from "@/features/copilot/types";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(40),
});

const SYSTEM_PROMPT = `You are the AI Copilot embedded in TerraScope AI, a real-time global intelligence platform showing live earthquakes, weather, air quality, wildfires, and flight traffic on a 3D globe.

Answer questions using the provided tools rather than prior knowledge — the tools return live data, your training data does not. Use your own geographic knowledge to resolve place names to latitude/longitude when calling tools; ask for clarification only if a location is genuinely ambiguous.

Be concise and analyst-style: lead with the concrete answer (numbers, magnitudes, counts), then brief supporting detail. Note data limitations when relevant (e.g. wildfire detection requires a configured API key; flight tracking only covers a small radius around a point and can be rate-limited). Do not fabricate data you did not retrieve via a tool call.`;

const MAX_ITERATIONS = 6;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ configured: false } satisfies CopilotChatResponse);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const client = new Anthropic();
  const messages: Anthropic.MessageParam[] = parsed.data.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    let replyText = "I wasn't able to complete that — try rephrasing your question.";

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: "claude-opus-4-8",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        thinking: { type: "adaptive" },
        tools: COPILOT_TOOLS,
        messages,
      });

      if (response.stop_reason === "tool_use") {
        messages.push({ role: "assistant", content: response.content });

        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
        );
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const tool of toolUseBlocks) {
          try {
            const result = await executeCopilotTool(tool.name, tool.input);
            toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: JSON.stringify(result) });
          } catch (err) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: tool.id,
              content: err instanceof Error ? err.message : "Tool execution failed",
              is_error: true,
            });
          }
        }

        messages.push({ role: "user", content: toolResults });
        continue;
      }

      if (response.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: response.content });
        continue;
      }

      if (response.stop_reason === "refusal") {
        replyText = "I can't help with that request.";
        break;
      }

      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
      replyText = textBlock?.text ?? replyText;
      break;
    }

    return Response.json({ configured: true, reply: replyText } satisfies CopilotChatResponse);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "Invalid ANTHROPIC_API_KEY" }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "Rate limited — try again shortly" }, { status: 429 });
    }
    return Response.json({ error: "Copilot request failed" }, { status: 500 });
  }
}
