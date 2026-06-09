"use client";

import { useChat } from "@ai-sdk/react";
import { createIdGenerator, DefaultChatTransport } from "ai";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Compass,
  Menu,
  MessageCircle,
  RefreshCw,
  Send,
  Square,
} from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Response } from "../components/ai/Response";
import { OpenUIBookingRenderer } from "../components/booking/OpenUIBookingRenderer";
import { ChatHistoryPanel } from "../components/chat-history/ChatHistoryPanel";
import { getStoredChat } from "../components/chat-history/browserChatStorage";
import { useEstateChatHistory } from "../components/chat-history/useEstateChatHistory";
import {
  createClientChatId,
  ESTATE_CHAT_ID_STORAGE_KEY,
  MESSAGE_ID_PREFIX,
  SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT,
  SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY,
  type EstateUIMessage,
  type NavigationTarget,
  type SemanticNavigationSpotlightPayload,
} from "../types/estate-chat";
import styles from "./chat.module.css";

type HandoffFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const suggestions = [
  "I am not sure where to start.",
  "Explain Wills, Trusts and LPAs in plain English.",
  "How does care planning work?",
  "Can I book an initial chat this week?",
  "Take me to the contact page.",
];

function messageText(message: EstateUIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function ChatResponse({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <Response className={styles.assistantText} streaming={streaming}>
      {text}
    </Response>
  );
}

function isBookingToolPart(part: EstateUIMessage["parts"][number]) {
  return part.type === "tool-bookingLink" || part.type === "tool-getAvailableSlots" || part.type === "tool-createBooking";
}

function AssistantMessageParts({
  message,
  streaming,
  onUserMessage,
}: {
  message: EstateUIMessage;
  streaming: boolean;
  onUserMessage: (message: string) => void;
}) {
  return message.parts.map((part, partIndex) => {
    if (part.type === "text") {
      return (
        <ChatResponse
          key={`${message.id}-${partIndex}`}
          text={part.text}
          streaming={streaming}
        />
      );
    }
    if (isBookingToolPart(part)) {
      return (
        <OpenUIBookingRenderer
          key={`${message.id}-${partIndex}`}
          part={part}
          isStreaming={streaming}
          onUserMessage={onUserMessage}
        />
      );
    }
    return null;
  });
}

export default function ChatPageClient({ initialChatId }: { initialChatId: string }) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId || createClientChatId);
  const [input, setInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [handoffMode, setHandoffMode] = useState<"idle" | "needs-details" | "sending" | "sent" | "saved" | "error">("idle");
  const [handoffError, setHandoffError] = useState("");
  const [handoffForm, setHandoffForm] = useState<HandoffFormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const pendingAutoNavigationRef = useRef<{ target: NavigationTarget; targets: NavigationTarget[]; query?: string } | null>(null);
  const refreshHistoryRef = useRef<(() => void) | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const spotlightPayload = (target: NavigationTarget, auto = true, query?: string, targets: NavigationTarget[] = [target]): SemanticNavigationSpotlightPayload => {
    const destination = new URL(target.url, window.location.origin);
    const currentIndex = Math.max(0, targets.findIndex((item) => item.url === target.url));
    return {
      title: target.title,
      summary: target.summary,
      url: target.url,
      auto,
      highlight: destination.hash ? destination.hash.slice(1) : "main",
      query,
      targets,
      currentIndex,
    };
  };

  const navigateTo = (target: NavigationTarget, query?: string, targets: NavigationTarget[] = [target]) => {
    const destination = new URL(target.url, window.location.origin);
    destination.searchParams.set("highlight", destination.hash ? destination.hash.slice(1) : "main");
    const payload = spotlightPayload(target, true, query, targets);
    if (destination.pathname === window.location.pathname) {
      window.history.pushState(null, "", `${destination.pathname}${destination.search}${destination.hash}`);
      window.dispatchEvent(new CustomEvent(SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT, { detail: payload }));
      return;
    }
    window.sessionStorage.setItem(SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY, JSON.stringify(payload));
    router.push(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  const transport = useMemo(
    () =>
      new DefaultChatTransport<EstateUIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: (request) => {
          const lastMessage = request.messages.at(-1);
          const isLatestUserMessage = request.trigger === "submit-message" && lastMessage?.role === "user";

          return {
            body: {
              id: request.id,
              ...(isLatestUserMessage ? { message: lastMessage } : { messages: request.messages }),
              trigger: request.trigger,
              messageId: request.messageId,
              metadata: {
                pageUrl: window.location.href,
              },
            },
          };
        },
      }),
    [],
  );

  const { messages, setMessages, sendMessage, regenerate, status, stop, error } = useChat<EstateUIMessage>({
    id: chatId,
    transport,
    generateId: createIdGenerator({
      prefix: MESSAGE_ID_PREFIX.replace(/_$/, ""),
      size: 16,
    }),
    experimental_throttle: 80,
    onData: (dataPart) => {
      if (dataPart.type === "data-chat-metadata" && dataPart.data.handoff) {
        const handoff = dataPart.data.handoff;
        if (handoff.status === "needs_details") {
          setHandoffMode("needs-details");
          setHandoffForm((current) => ({
            ...current,
            name: handoff.contact?.name || current.name,
            email: handoff.contact?.email || current.email,
            phone: handoff.contact?.phone || current.phone,
          }));
        } else if (handoff.crm?.status === "created") {
          setHandoffMode("sent");
        }
      }
      if (dataPart.type !== "data-ui-action" || dataPart.data.kind !== "semantic-navigation") return;
      const target = dataPart.data.targets[0] ?? null;
      pendingAutoNavigationRef.current = dataPart.data.auto && target ? { target, targets: dataPart.data.targets, query: dataPart.data.query } : null;
    },
    onFinish: () => {
      const pending = pendingAutoNavigationRef.current;
      pendingAutoNavigationRef.current = null;
      refreshHistoryRef.current?.();
      if (!pending) return;
      window.setTimeout(() => navigateTo(pending.target, pending.query, pending.targets), 900);
    },
  });

  const isBusy = status === "submitted" || status === "streaming";
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const handoffMessage = handoffForm.message || (latestUserMessage ? messageText(latestUserMessage) : "");

  const selectChatSession = (nextChatId: string) => {
    stop();
    setChatId(nextChatId);
    setMessages(getStoredChat(nextChatId)?.messages ?? []);
    setInput("");
    setHistoryError("");
    setHandoffMode("idle");
    setHandoffError("");
    setHistoryPanelOpen(false);
    router.push(`/chat/${encodeURIComponent(nextChatId)}`);
  };

  const createChatSession = (nextChatId: string) => {
    stop();
    setChatId(nextChatId);
    setMessages([]);
    setInput("");
    setHistoryError("");
    setHandoffMode("idle");
    setHandoffError("");
    setHistoryPanelOpen(false);
    router.push(`/chat/${encodeURIComponent(nextChatId)}`);
  };

  const chatHistory = useEstateChatHistory({
    activeChatId: chatId,
    onCreateChat: createChatSession,
    onSelectChat: selectChatSession,
  });
  refreshHistoryRef.current = () => void chatHistory.loadHistory({ reset: true });

  useEffect(() => {
    const storedChatId = window.localStorage.getItem(ESTATE_CHAT_ID_STORAGE_KEY);
    const nextChatId = initialChatId || storedChatId || chatId;
    setChatId(nextChatId);
    setMessages(getStoredChat(nextChatId)?.messages ?? []);
    window.localStorage.setItem(ESTATE_CHAT_ID_STORAGE_KEY, nextChatId);
    if (!initialChatId) {
      window.history.replaceState(null, "", `/chat/${encodeURIComponent(nextChatId)}`);
    }
    void chatHistory.loadHistory({ reset: true });
    // Run once on mount. Session switches are handled explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsLoadingHistory(false);
    setHistoryError("");
    setMessages(getStoredChat(chatId)?.messages ?? []);
  }, [chatId, setMessages]);

  useEffect(() => {
    if (!messages.length) return;
    chatHistory.saveChat({
      id: chatId,
      messages,
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/chat",
    });
  }, [chatHistory.saveChat, chatId, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status, handoffMode]);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    setHandoffError("");
    pendingAutoNavigationRef.current = null;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const submitHandoff = async () => {
    if (handoffMode === "sending") return;
    setHandoffError("");
    setHandoffMode("sending");

    try {
      const response = await fetch("/api/assistant-handoff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...handoffForm,
          message: handoffMessage,
          pageUrl: window.location.href,
          chatId,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { status?: "sent" | "saved"; error?: string };
      if (!response.ok) throw new Error(result.error || "Could not send the handoff.");
      setHandoffMode(result.status === "sent" ? "sent" : "saved");
    } catch (handoffSubmitError) {
      setHandoffMode("error");
      setHandoffError(
        handoffSubmitError instanceof Error
          ? handoffSubmitError.message
          : "Could not send the handoff. Please try again or call Pathway.",
      );
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.shell} aria-label="Pathway full chat">
        <ChatHistoryPanel
          activeChatId={chatId}
          actionId={chatHistory.actionId}
          chats={chatHistory.chats}
          error={chatHistory.error}
          groupedChats={chatHistory.groupedChats}
          hasMore={chatHistory.hasMore}
          isLoading={chatHistory.isLoading}
          onClose={() => setHistoryPanelOpen(false)}
          onDeleteAllChats={() => void chatHistory.deleteAllChats()}
          onDeleteChat={(targetChatId) => void chatHistory.deleteChat(targetChatId)}
          onLoadMore={() => void chatHistory.loadHistory()}
          onNewChat={chatHistory.startNewChat}
          onSwitchChat={chatHistory.switchChat}
          open={historyPanelOpen}
          showCloseButton
        />

        <section className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div>
              <span>
                <MessageCircle size={16} aria-hidden="true" />
                Public chat
              </span>
              <strong>{isLoadingHistory ? "Loading conversation..." : "Conversation"}</strong>
            </div>
            <div className={styles.chatHeaderActions}>
              <button className={styles.mobileHistoryButton} type="button" onClick={() => setHistoryPanelOpen(true)}>
                <Menu size={15} aria-hidden="true" />
                History
              </button>
              <button type="button" onClick={() => regenerate()} disabled={isBusy || messages.length < 2}>
                <RefreshCw size={15} aria-hidden="true" />
                Regenerate
              </button>
            </div>
          </div>

          <div className={styles.messages} ref={scrollRef}>
            {historyError && <div className={styles.errorBubble}>{historyError}</div>}
            {messages.length === 0 && !historyError && (
              <div className={styles.emptyState}>
                <Compass size={26} aria-hidden="true" />
                <h2>What would you like to sort out?</h2>
                <p>Start with a topic, a concern, or the page you are trying to find.</p>
                <div className={styles.suggestions}>
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => submitText(suggestion)} disabled={isBusy}>
                      {suggestion}
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, messageIndex) => {
              const isLastMessage = messageIndex === messages.length - 1;
              const hasRenderableParts = message.role === "user" || message.parts.some((part) => part.type === "text" || isBookingToolPart(part));
              if (!hasRenderableParts) return null;

              return (
                <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={message.id}>
                  {message.role === "user" ? (
                    <span>{messageText(message)}</span>
                  ) : (
                    <AssistantMessageParts
                      message={message}
                      streaming={isLastMessage && status === "streaming"}
                      onUserMessage={submitText}
                    />
                  )}
                </div>
              );
            })}

            {status === "submitted" && (
              <div className={styles.statusBubble}>
                Thinking...
              </div>
            )}
            {error && <div className={styles.errorBubble}>The chat had trouble connecting. Please try again or call 07902 863999.</div>}

            {(handoffMode === "needs-details" || handoffMode === "sending" || handoffMode === "error") && (
              <form
                className={styles.handoffForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitHandoff();
                }}
              >
                <div>
                  <strong>Ask Pathway to contact you</strong>
                  <p>Share only the details you are comfortable sending. A name and either email or phone is enough.</p>
                </div>
                <Field className={styles.handoffField}>
                  <FieldLabel className={styles.handoffLabel}>Name</FieldLabel>
                  <Input value={handoffForm.name} onChange={(event) => setHandoffForm((current) => ({ ...current, name: event.target.value }))} autoComplete="name" required />
                </Field>
                <div className={styles.handoffFields}>
                  <Field className={styles.handoffField}>
                    <FieldLabel className={styles.handoffLabel}>Email</FieldLabel>
                    <Input value={handoffForm.email} onChange={(event) => setHandoffForm((current) => ({ ...current, email: event.target.value }))} autoComplete="email" type="email" />
                  </Field>
                  <Field className={styles.handoffField}>
                    <FieldLabel className={styles.handoffLabel}>Phone</FieldLabel>
                    <Input value={handoffForm.phone} onChange={(event) => setHandoffForm((current) => ({ ...current, phone: event.target.value }))} autoComplete="tel" type="tel" />
                  </Field>
                </div>
                <Field className={styles.handoffField}>
                  <FieldLabel className={styles.handoffLabel}>What should Pathway know?</FieldLabel>
                  <Textarea value={handoffForm.message} onChange={(event) => setHandoffForm((current) => ({ ...current, message: event.target.value }))} rows={3} placeholder={handoffMessage || "A short note is optional."} />
                </Field>
                {handoffError && <p className={styles.handoffError}>{handoffError}</p>}
                <button type="submit" disabled={handoffMode === "sending"}>{handoffMode === "sending" ? "Sending..." : "Send to Pathway"}</button>
              </form>
            )}

            {(handoffMode === "sent" || handoffMode === "saved") && (
              <div className={styles.handoffSuccess}>
                {handoffMode === "sent" ? "Thanks, those details have been sent to Pathway." : "Thanks, those details have been saved for Pathway."}
              </div>
            )}
          </div>

          <form
            className={styles.composer}
            onSubmit={(event) => {
              event.preventDefault();
              submitText(input);
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" || event.shiftKey) return;
                event.preventDefault();
                submitText(input);
              }}
              placeholder="Ask a general estate planning question..."
              rows={2}
              disabled={isBusy || isLoadingHistory}
            />
            <button type={isBusy ? "button" : "submit"} onClick={isBusy ? stop : undefined} aria-label={isBusy ? "Stop response" : "Send message"}>
              {isBusy ? <Square size={17} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
