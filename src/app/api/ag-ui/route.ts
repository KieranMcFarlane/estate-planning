import {
  chunkText,
  fallbackAnswer,
  fetchParlantAnswer,
  type NavigationTarget,
  type ParlantChatMessage,
} from "../_lib/estate-chat";

export const runtime = "nodejs";
export const maxDuration = 30;

type AgUiInputMessage = {
  id?: string;
  role: string;
  content?: string;
};

type AgUiRunInput = {
  threadId?: string;
  thread_id?: string;
  runId?: string;
  run_id?: string;
  messages?: AgUiInputMessage[];
  state?: Record<string, unknown>;
  context?: unknown[];
  forwardedProps?: Record<string, unknown>;
  forwarded_props?: Record<string, unknown>;
};

function agUiId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toParlantMessages(messages: AgUiInputMessage[] | undefined): ParlantChatMessage[] {
  return (messages ?? [])
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      role: message.role,
      content: message.content ?? "",
    }))
    .filter((message) => message.content.trim().length > 0);
}

function sse(event: Record<string, unknown>) {
  return `data: ${JSON.stringify(event)}\n\n`;
}

function customEvent(name: string, value: unknown) {
  return {
    type: "CUSTOM",
    name,
    value,
  };
}

function navigationValue(navigation: {
  type: string;
  auto?: boolean;
  targets?: NavigationTarget[];
} | null | undefined) {
  if (!navigation?.targets?.length) return null;
  return {
    kind: "semantic-navigation",
    auto: Boolean(navigation.auto),
    targets: navigation.targets,
  };
}

export async function POST(request: Request) {
  const input = (await request.json()) as AgUiRunInput;
  const threadId = input.threadId ?? input.thread_id ?? agUiId("thread");
  const runId = input.runId ?? input.run_id ?? agUiId("run");
  const messageId = agUiId("msg");
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const write = (event: Record<string, unknown>) => controller.enqueue(encoder.encode(sse(event)));

      write({ type: "RUN_STARTED", threadId, runId });

      let text = fallbackAnswer();
      try {
        const result = await fetchParlantAnswer({
          id: runId,
          messages: toParlantMessages(input.messages),
          metadata: {
            agUi: true,
            threadId,
            runId,
            state: input.state ?? {},
            context: input.context ?? [],
            forwardedProps: input.forwardedProps ?? input.forwarded_props ?? {},
          },
        });

        text = result.text || fallbackAnswer();
        write(
          customEvent("pathway.chat_metadata", {
            matchedRoutes: result.matchedRoutes ?? [],
            handoff: result.handoff ?? null,
            guardrails: result.guardrails ?? [],
            model: result.model ?? null,
            navigation: result.navigation ?? null,
          }),
        );

        const navigation = navigationValue(result.navigation);
        if (navigation) write(customEvent("pathway.ui_action", navigation));
      } catch (error) {
        write(
          customEvent("pathway.chat_metadata", {
            error: error instanceof Error ? error.message : "unknown_error",
            fallback: true,
          }),
        );
      }

      write({ type: "TEXT_MESSAGE_START", messageId, role: "assistant" });
      for (const chunk of chunkText(text)) {
        write({ type: "TEXT_MESSAGE_CONTENT", messageId, delta: chunk });
        await new Promise((resolve) => setTimeout(resolve, 14));
      }
      write({ type: "TEXT_MESSAGE_END", messageId });
      write({ type: "RUN_FINISHED", threadId, runId });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
