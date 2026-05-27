"use client";

import { useEffect, useMemo, useRef, useState, type TouchEvent, type WheelEvent as ReactWheelEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { createIdGenerator, DefaultChatTransport } from "ai";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowDown,
  Calendar,
  Check,
  Copy,
  HeartHandshake,
  Maximize2,
  Menu,
  MessageCircle,
  Minimize2,
  PanelLeft,
  PenSquare,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  Square,
  Trash2,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Response } from "./ai/Response";
import { ChatHistoryPanel } from "./chat-history/ChatHistoryPanel";
import { getStoredChat } from "./chat-history/browserChatStorage";
import { useEstateChatHistory } from "./chat-history/useEstateChatHistory";
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
import styles from "./EstateAssistant.module.css";

type HandoffFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const suggestions = [
  "I am not sure what estate planning I need.",
  "Can you explain wills and LPAs in plain English?",
  "Show me where you explain trusts.",
  "How can trusts help protect family assets?",
  "I would like someone to contact me about an initial chat.",
];

function partText(message: EstateUIMessage) {
  return message.parts
    .map((part) => {
      if (part.type === "text") return part.text;
      return "";
    })
    .join("");
}

function AssistantText({ text, streaming }: { text: string; streaming: boolean }) {
  return (
    <Response className={styles.assistantText} streaming={streaming}>
      {text}
    </Response>
  );
}

export default function EstateAssistant() {
  const router = useRouter();
  const pathname = usePathname();
  const [chatId, setChatId] = useState(createClientChatId);
  const [open, setOpen] = useState(false);
  const [fullChatOpen, setFullChatOpen] = useState(false);
  const [fullHistoryOpen, setFullHistoryOpen] = useState(false);
  const [input, setInput] = useState("");
  const [fullInput, setFullInput] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
  const stickToBottomRef = useRef(true);
  const fullStickToBottomRef = useRef(true);
  const touchStartYRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fullScrollRef = useRef<HTMLDivElement>(null);

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
    const currentPath = window.location.pathname;
    destination.searchParams.set("highlight", destination.hash ? destination.hash.slice(1) : "main");
    const payload = spotlightPayload(target, true, query, targets);
    setFullChatOpen(false);

    if (destination.pathname === currentPath) {
      const nextUrl = `${destination.pathname}${destination.search}${destination.hash}`;
      window.history.pushState(null, "", nextUrl);
      window.dispatchEvent(new CustomEvent(SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT, { detail: payload }));
      setOpen(false);
      return;
    }

    window.sessionStorage.setItem(SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY, JSON.stringify(payload));
    setOpen(false);
    router.push(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  const transport = useMemo(
    () =>
      new DefaultChatTransport<EstateUIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: (request) => ({
          body: {
            id: request.id,
            message: request.messages.at(-1),
            trigger: request.trigger,
            messageId: request.messageId,
            metadata: {
              pageUrl: typeof window !== "undefined" ? window.location.href : "",
            },
          },
        }),
      }),
    [],
  );

  const { messages, setMessages, sendMessage, status, stop, error, regenerate } = useChat<EstateUIMessage>({
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

  const resetTransientChatState = () => {
    setInput("");
    setFullInput("");
    setHistoryError("");
    setHandoffMode("idle");
    setHandoffError("");
    pendingAutoNavigationRef.current = null;
  };

  const selectChatSession = (nextChatId: string) => {
    stop();
    setChatId(nextChatId);
    setMessages(getStoredChat(nextChatId)?.messages ?? []);
    resetTransientChatState();
    if (window.matchMedia("(max-width: 880px)").matches) setFullHistoryOpen(false);
  };

  const createChatSession = (nextChatId: string) => {
    stop();
    setChatId(nextChatId);
    setMessages([]);
    resetTransientChatState();
    if (window.matchMedia("(max-width: 880px)").matches) setFullHistoryOpen(false);
  };

  const chatHistory = useEstateChatHistory({
    activeChatId: chatId,
    onCreateChat: createChatSession,
    onSelectChat: selectChatSession,
  });
  refreshHistoryRef.current = () => void chatHistory.loadHistory({ reset: true });

  useEffect(() => {
    const storedChatId = window.localStorage.getItem(ESTATE_CHAT_ID_STORAGE_KEY);
    if (storedChatId) {
      setChatId(storedChatId);
      return;
    }
    window.localStorage.setItem(ESTATE_CHAT_ID_STORAGE_KEY, chatId);
  }, [chatId]);

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
      sourcePage: typeof window !== "undefined" ? window.location.pathname : "/",
    });
  }, [chatHistory.saveChat, chatId, messages]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !open || !stickToBottomRef.current) return;

    requestAnimationFrame(() => {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    });
  }, [messages, status, open]);

  useEffect(() => {
    const scrollElement = fullScrollRef.current;
    if (!scrollElement || !fullChatOpen || !fullStickToBottomRef.current) return;

    requestAnimationFrame(() => {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    });
  }, [messages, status, fullChatOpen]);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
      window.setTimeout(() => window.scrollTo(0, scrollY), 0);
    };
  }, [open]);

  const updateScrollStickiness = () => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const distanceFromBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
    stickToBottomRef.current = distanceFromBottom < 48;
  };

  const shouldContainScroll = (deltaY: number) => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || scrollElement.scrollHeight <= scrollElement.clientHeight) return false;

    const atTop = scrollElement.scrollTop <= 0;
    const atBottom =
      scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 1;

    return (deltaY < 0 && atTop) || (deltaY > 0 && atBottom);
  };

  const containWheelAtBoundary = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!shouldContainScroll(event.deltaY)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const rememberTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? 0;
  };

  const containTouchAtBoundary = (event: TouchEvent<HTMLDivElement>) => {
    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
    const deltaY = touchStartYRef.current - currentY;
    if (!shouldContainScroll(deltaY)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !open) return;

    const containNativeWheel = (event: WheelEvent) => {
      if (!shouldContainScroll(event.deltaY)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    const containNativeTouch = (event: globalThis.TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
      const deltaY = touchStartYRef.current - currentY;
      if (!shouldContainScroll(deltaY)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    scrollElement.addEventListener("wheel", containNativeWheel, { passive: false });
    scrollElement.addEventListener("touchmove", containNativeTouch, { passive: false });

    return () => {
      scrollElement.removeEventListener("wheel", containNativeWheel);
      scrollElement.removeEventListener("touchmove", containNativeTouch);
    };
  }, [open]);

  const submitText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    pendingAutoNavigationRef.current = null;
    setHandoffError("");
    stickToBottomRef.current = true;
    fullStickToBottomRef.current = true;
    sendMessage({ text: trimmed });
    setInput("");
    setFullInput("");
  };

  const copyMessage = async (message: EstateUIMessage) => {
    const text = partText(message).trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(message.id);
    window.setTimeout(() => setCopiedMessageId((current) => (current === message.id ? null : current)), 1400);
  };

  const regenerateLastResponse = () => {
    if (isBusy) return;
    pendingAutoNavigationRef.current = null;
    fullStickToBottomRef.current = true;
    stickToBottomRef.current = true;
    void regenerate();
  };

  const updateFullScrollStickiness = () => {
    const scrollElement = fullScrollRef.current;
    if (!scrollElement) return;

    const distanceFromBottom =
      scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
    fullStickToBottomRef.current = distanceFromBottom < 80;
  };

  const scrollFullChatToBottom = () => {
    fullStickToBottomRef.current = true;
    fullScrollRef.current?.scrollTo({ top: fullScrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const openFullChat = () => {
    setOpen(false);
    setFullChatOpen(true);
    setFullHistoryOpen(!window.matchMedia("(max-width: 880px)").matches);
    fullStickToBottomRef.current = true;
    void chatHistory.loadHistory({ reset: true });
  };

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const handoffMessage = handoffForm.message || (latestUserMessage ? partText(latestUserMessage) : "");

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

  if (pathname?.startsWith("/chat") || pathname?.startsWith("/operator")) return null;

  return (
    <div className={styles.assistant} data-open={open}>
      <Dialog open={fullChatOpen} onOpenChange={setFullChatOpen}>
        <DialogContent
          className={styles.fullDialog}
          showCloseButton={false}
          aria-label="Pathway maximised planning chat"
        >
          <section className={styles.fullShell} data-sidebar={fullHistoryOpen ? "open" : "closed"} aria-label="Pathway maximised planning chat">
            <aside className={styles.fullRail} aria-label="Chat workspace controls">
              <div className={styles.fullRailTop}>
                <button
                  className={styles.railButton}
                  type="button"
                  onClick={() => setFullHistoryOpen((current) => !current)}
                  aria-label={fullHistoryOpen ? "Collapse chat history" : "Expand chat history"}
                  aria-pressed={fullHistoryOpen}
                >
                  <PanelLeft size={18} aria-hidden="true" />
                </button>
                <button
                  className={styles.railButton}
                  type="button"
                  onClick={chatHistory.startNewChat}
                  aria-label="New chat"
                >
                  <PenSquare size={18} aria-hidden="true" />
                </button>
                <button
                  className={styles.railButton}
                  type="button"
                  onClick={() => void chatHistory.deleteAllChats()}
                  aria-label="Delete all chats"
                  disabled={!chatHistory.chats.length || chatHistory.actionId === "all"}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.fullRailBottom}>
                <span className={styles.guestDot} aria-hidden="true" />
                <span className={styles.guestLabel}>Guest</span>
              </div>
            </aside>

            <div className={styles.fullSidebar} data-open={fullHistoryOpen}>
              <ChatHistoryPanel
                activeChatId={chatId}
                actionId={chatHistory.actionId}
                chats={chatHistory.chats}
                error={chatHistory.error}
                groupedChats={chatHistory.groupedChats}
                hasMore={chatHistory.hasMore}
                isLoading={chatHistory.isLoading}
                onClose={() => setFullHistoryOpen(false)}
                onDeleteAllChats={() => void chatHistory.deleteAllChats()}
                onDeleteChat={(targetChatId) => void chatHistory.deleteChat(targetChatId)}
                onLoadMore={() => void chatHistory.loadHistory()}
                onNewChat={chatHistory.startNewChat}
                onSwitchChat={chatHistory.switchChat}
                open={fullHistoryOpen}
                showCloseButton
                showSideActions={false}
                surface="overlay"
              />
            </div>

            <section className={styles.fullMain} aria-label="Active Pathway chat">
              <DialogHeader className={styles.fullHeader}>
                <DialogTitle className="sr-only">Ask Pathway</DialogTitle>
                <div className={styles.fullHeaderActions}>
                  <button className={`${styles.iconButton} ${styles.fullHistoryButton}`} type="button" onClick={() => setFullHistoryOpen(true)} aria-label="Open chat history">
                    <Menu size={18} aria-hidden="true" />
                  </button>
                  <DialogClose className={styles.iconButton} aria-label="Minimise full chat">
                    <Minimize2 size={18} aria-hidden="true" />
                  </DialogClose>
                  <button
                    className={styles.iconButton}
                    type="button"
                    onClick={() => {
                      setFullChatOpen(false);
                      setOpen(false);
                    }}
                    aria-label="Close assistant"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </DialogHeader>

              <div className={styles.fullConversationWrap}>
                <div
                  className={styles.fullConversation}
                  ref={fullScrollRef}
                  onScroll={updateFullScrollStickiness}
                >
                  <div className={styles.fullConversationInner}>
                    <div className={styles.fullIntro}>
                      <HeartHandshake size={20} aria-hidden="true" />
                      <div>
                        <strong>Start with what you are trying to sort out.</strong>
                        <p>I can explain the basics, find the right page, or help you arrange a conversation with Pathway.</p>
                      </div>
                    </div>

                    {historyError && <div className={styles.errorBubble}>{historyError}</div>}

                    {messages.length === 0 && !historyError && (
                      <div className={styles.fullSuggestionGrid} aria-label="Suggested prompts">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            className={styles.fullSuggestion}
                            type="button"
                            onClick={() => submitText(suggestion)}
                            disabled={isBusy || isLoadingHistory}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {messages.map((message, messageIndex) => {
                      const textParts = message.parts.filter((part) => part.type === "text");
                      if (!textParts.length) return null;
                      const isLastMessage = messageIndex === messages.length - 1;

                      return (
                        <div className={message.role === "user" ? styles.fullMessageUser : styles.fullMessageAssistant} key={message.id}>
                          <div className={styles.fullMessageStack}>
                            {message.role === "user" ? (
                              <span>{partText(message)}</span>
                            ) : (
                              textParts.map((part, partIndex) => (
                                <AssistantText
                                  key={`${message.id}-${partIndex}`}
                                  text={part.text}
                                  streaming={isLastMessage && status === "streaming"}
                                />
                              ))
                            )}
                            <div className={styles.fullMessageActions} aria-label="Message actions">
                              <button
                                className={styles.fullMessageAction}
                                type="button"
                                onClick={() => void copyMessage(message)}
                                aria-label={copiedMessageId === message.id ? "Copied message" : "Copy message"}
                                title={copiedMessageId === message.id ? "Copied" : "Copy"}
                              >
                                {copiedMessageId === message.id ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                              </button>
                              {message.role === "assistant" && isLastMessage && status !== "streaming" && (
                                <button
                                  className={styles.fullMessageAction}
                                  type="button"
                                  onClick={regenerateLastResponse}
                                  aria-label="Regenerate response"
                                  title="Regenerate"
                                  disabled={isBusy}
                                >
                                  <RotateCcw size={15} aria-hidden="true" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {status === "submitted" && (
                      <div className={styles.statusBubble}>Checking the guarded Pathway knowledgebase...</div>
                    )}
                    {error && (
                      <div className={styles.errorBubble}>
                        The chat had trouble connecting. Please call 07902 863999 or try again.
                      </div>
                    )}

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
                        <label>
                          <span>Name</span>
                          <input
                            value={handoffForm.name}
                            onChange={(event) => setHandoffForm((current) => ({ ...current, name: event.target.value }))}
                            autoComplete="name"
                            required
                          />
                        </label>
                        <div className={styles.handoffFields}>
                          <label>
                            <span>Email</span>
                            <input
                              value={handoffForm.email}
                              onChange={(event) => setHandoffForm((current) => ({ ...current, email: event.target.value }))}
                              autoComplete="email"
                              type="email"
                            />
                          </label>
                          <label>
                            <span>Phone</span>
                            <input
                              value={handoffForm.phone}
                              onChange={(event) => setHandoffForm((current) => ({ ...current, phone: event.target.value }))}
                              autoComplete="tel"
                              type="tel"
                            />
                          </label>
                        </div>
                        <label>
                          <span>What should Pathway know?</span>
                          <textarea
                            value={handoffForm.message}
                            onChange={(event) => setHandoffForm((current) => ({ ...current, message: event.target.value }))}
                            rows={3}
                            placeholder={handoffMessage || "A short note is optional."}
                          />
                        </label>
                        {handoffError && <p className={styles.handoffError}>{handoffError}</p>}
                        <button className={styles.handoffSubmit} type="submit" disabled={handoffMode === "sending"}>
                          {handoffMode === "sending" ? "Sending..." : "Send to Pathway"}
                        </button>
                      </form>
                    )}

                    {(handoffMode === "sent" || handoffMode === "saved") && (
                      <div className={styles.handoffSuccess}>
                        {handoffMode === "sent"
                          ? "Thanks, I have sent those details to Pathway."
                          : "Thanks, I have saved those details for Pathway. If it is urgent, please call 07902 863999."}
                      </div>
                    )}
                  </div>
                </div>
                <button className={styles.fullScrollButton} type="button" onClick={scrollFullChatToBottom} aria-label="Scroll to bottom">
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>

              <form
                className={styles.fullComposer}
                onSubmit={(event) => {
                  event.preventDefault();
                  submitText(fullInput);
                }}
              >
                <textarea
                  value={fullInput}
                  onChange={(event) => setFullInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" || event.shiftKey) return;
                    event.preventDefault();
                    submitText(fullInput);
                  }}
                  rows={2}
                  placeholder="Ask a general estate planning question..."
                  disabled={isBusy || isLoadingHistory}
                />
                <button className={styles.fullSendButton} type={isBusy ? "button" : "submit"} onClick={isBusy ? stop : undefined} aria-label={isBusy ? "Stop response" : "Send message"}>
                  {isBusy ? <Square size={16} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
                </button>
              </form>
            </section>
          </section>
        </DialogContent>
      </Dialog>

      {open ? (
        <section className={styles.panel} aria-label="Pathway planning assistant">
          <div className={styles.header}>
            <div>
              <span className={styles.kicker}>
                <Sparkles size={14} aria-hidden="true" />
                Guarded planning chat
              </span>
              <h2>Ask Pathway</h2>
            </div>
            <div className={styles.headerActions}>
              <button className={styles.iconButton} type="button" onClick={openFullChat} aria-label="Open full chat">
                <Maximize2 size={18} aria-hidden="true" />
              </button>
              <button className={styles.iconButton} type="button" onClick={() => setOpen(false)} aria-label="Close assistant">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className={styles.conversation}
            ref={scrollRef}
            onScroll={updateScrollStickiness}
            onWheel={containWheelAtBoundary}
            onTouchStart={rememberTouchStart}
            onTouchMove={containTouchAtBoundary}
          >
            <div className={styles.messageAssistant}>
              <HeartHandshake size={18} aria-hidden="true" />
              <p>
                Ask what you are trying to sort out and I will point you to the clearest starting place. I can explain the basics, find the right page, or help you arrange a conversation with Pathway.
              </p>
            </div>

            {messages.length === 0 && (
              <div className={styles.topicGrid} aria-label="Suggested prompts">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    className={styles.topic}
                    type="button"
                    onClick={() => submitText(suggestion)}
                    disabled={isBusy}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, messageIndex) => {
              const textParts = message.parts.filter((part) => part.type === "text");
              if (!textParts.length) return null;
              const isLastMessage = messageIndex === messages.length - 1;

              return (
                <div
                  className={message.role === "user" ? styles.messageUser : styles.liveMessageAssistant}
                  key={message.id}
                >
                  {message.role === "user" ? (
                    <span>{partText(message)}</span>
                  ) : (
                    textParts.map((part, partIndex) => (
                      <AssistantText
                        key={`${message.id}-${partIndex}`}
                        text={part.text}
                        streaming={isLastMessage && status === "streaming"}
                      />
                    ))
                  )}
                </div>
              );
            })}

            {status === "submitted" && (
              <div className={styles.statusBubble}>Checking the guarded Pathway knowledgebase...</div>
            )}
            {error && (
              <div className={styles.errorBubble}>
                The chat had trouble connecting. Please call 07902 863999 or try again.
              </div>
            )}

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
                <label>
                  <span>Name</span>
                  <input
                    value={handoffForm.name}
                    onChange={(event) => setHandoffForm((current) => ({ ...current, name: event.target.value }))}
                    autoComplete="name"
                    required
                  />
                </label>
                <div className={styles.handoffFields}>
                  <label>
                    <span>Email</span>
                    <input
                      value={handoffForm.email}
                      onChange={(event) => setHandoffForm((current) => ({ ...current, email: event.target.value }))}
                      autoComplete="email"
                      type="email"
                    />
                  </label>
                  <label>
                    <span>Phone</span>
                    <input
                      value={handoffForm.phone}
                      onChange={(event) => setHandoffForm((current) => ({ ...current, phone: event.target.value }))}
                      autoComplete="tel"
                      type="tel"
                    />
                  </label>
                </div>
                <label>
                  <span>What should Pathway know?</span>
                  <textarea
                    value={handoffForm.message}
                    onChange={(event) => setHandoffForm((current) => ({ ...current, message: event.target.value }))}
                    rows={3}
                    placeholder={handoffMessage || "A short note is optional."}
                  />
                </label>
                {handoffError && <p className={styles.handoffError}>{handoffError}</p>}
                <button className={styles.handoffSubmit} type="submit" disabled={handoffMode === "sending"}>
                  {handoffMode === "sending" ? "Sending..." : "Send to Pathway"}
                </button>
              </form>
            )}

            {(handoffMode === "sent" || handoffMode === "saved") && (
              <div className={styles.handoffSuccess}>
                {handoffMode === "sent"
                  ? "Thanks, I have sent those details to Pathway."
                  : "Thanks, I have saved those details for Pathway. If it is urgent, please call 07902 863999."}
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
              rows={2}
              placeholder="Ask a general estate planning question..."
              disabled={isBusy}
            />
            <button className={styles.sendButton} type={isBusy ? "button" : "submit"} onClick={isBusy ? stop : undefined} aria-label={isBusy ? "Stop response" : "Send message"}>
              {isBusy ? <Square size={15} aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
            </button>
          </form>

          <div className={styles.actions}>
            <a href="tel:07902863999" className={styles.secondaryAction}>
              <Phone size={16} aria-hidden="true" />
              Call
            </a>
            <Link href="/contact" className={styles.primaryAction}>
              <Calendar size={16} aria-hidden="true" />
              Contact Pathway
            </Link>
          </div>
        </section>
      ) : null}

      <button className={styles.launcher} type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Open planning assistant">
        <MessageCircle size={20} aria-hidden="true" />
        <span>Planning assistant</span>
      </button>
    </div>
  );
}
