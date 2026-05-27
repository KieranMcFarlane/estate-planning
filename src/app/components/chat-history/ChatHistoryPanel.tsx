"use client";

import Link from "next/link";
import { Calendar, PenSquare, Phone, Trash2, X } from "lucide-react";
import type { ChatSummary, GroupedChats } from "./useEstateChatHistory";
import styles from "./ChatHistoryPanel.module.css";

type ChatHistoryPanelProps = {
  activeChatId: string;
  chats: ChatSummary[];
  groupedChats: GroupedChats;
  hasMore: boolean;
  error: string;
  isLoading: boolean;
  actionId: string | null;
  open?: boolean;
  showCloseButton?: boolean;
  showSideActions?: boolean;
  surface?: "page" | "overlay";
  onClose?: () => void;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onDeleteAllChats: () => void;
  onLoadMore: () => void;
};

function HistoryGroup({
  activeChatId,
  chats,
  label,
  actionId,
  onSwitchChat,
  onDeleteChat,
}: {
  activeChatId: string;
  chats: ChatSummary[];
  label: string;
  actionId: string | null;
  onSwitchChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}) {
  if (!chats.length) return null;

  return (
    <div className={styles.historyGroup}>
      <div className={styles.historyGroupLabel}>{label}</div>
      {chats.map((chat) => {
        const selectChat = () => onSwitchChat(chat.id);

        return (
          <div
            className={styles.historyItem}
            data-active={chat.id === activeChatId}
            key={chat.id}
            onClick={selectChat}
            onMouseDown={selectChat}
            onPointerDown={selectChat}
          >
            <a
              href={`/chat/${encodeURIComponent(chat.id)}`}
              onClick={(event) => {
                event.preventDefault();
                selectChat();
              }}
              onMouseDown={selectChat}
              onPointerDown={selectChat}
            >
              <span onClick={selectChat} onMouseDown={selectChat} onPointerDown={selectChat}>
                {chat.title}
              </span>
            </a>
            <button
              className={styles.historyDelete}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDeleteChat(chat.id);
              }}
              onMouseDown={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label={`Delete ${chat.title}`}
              disabled={actionId === chat.id}
            >
              <Trash2 size={13} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ChatHistoryPanel({
  activeChatId,
  chats,
  groupedChats,
  hasMore,
  error,
  isLoading,
  actionId,
  open = true,
  showCloseButton = false,
  showSideActions = true,
  surface = "page",
  onClose,
  onNewChat,
  onSwitchChat,
  onDeleteChat,
  onDeleteAllChats,
  onLoadMore,
}: ChatHistoryPanelProps) {
  return (
    <aside className={styles.sidebar} data-open={open} data-surface={surface}>
      <div className={styles.sidebarHeader}>
        {showCloseButton && (
          <button className={styles.sidebarClose} type="button" onClick={onClose} aria-label="Close chat history">
            <X size={17} aria-hidden="true" />
          </button>
        )}
        <p className={styles.kicker}>Guarded planning chat</p>
        <h1>Ask Pathway</h1>
        <p>A public, plain-English chat for finding the right starting point.</p>
      </div>

      <div className={styles.historyActions}>
        <button type="button" onClick={onNewChat}>
          <PenSquare size={15} aria-hidden="true" />
          New chat
        </button>
        <button type="button" onClick={onDeleteAllChats} disabled={!chats.length || actionId === "all"}>
          <Trash2 size={15} aria-hidden="true" />
          Delete all
        </button>
      </div>

      <div className={styles.historyList} aria-label="Previous conversations">
        <div className={styles.historyTitle}>History</div>
        {error && <p className={styles.historyNotice}>{error}</p>}
        {!error && isLoading && !chats.length && (
          <div className={styles.historySkeleton} aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
        {!error && !isLoading && !chats.length && (
          <p className={styles.historyNotice}>Your conversations will appear here once you start chatting.</p>
        )}
        <HistoryGroup
          activeChatId={activeChatId}
          actionId={actionId}
          chats={groupedChats.today}
          label="Today"
          onDeleteChat={onDeleteChat}
          onSwitchChat={onSwitchChat}
        />
        <HistoryGroup
          activeChatId={activeChatId}
          actionId={actionId}
          chats={groupedChats.yesterday}
          label="Yesterday"
          onDeleteChat={onDeleteChat}
          onSwitchChat={onSwitchChat}
        />
        <HistoryGroup
          activeChatId={activeChatId}
          actionId={actionId}
          chats={groupedChats.lastWeek}
          label="Last 7 days"
          onDeleteChat={onDeleteChat}
          onSwitchChat={onSwitchChat}
        />
        <HistoryGroup
          activeChatId={activeChatId}
          actionId={actionId}
          chats={groupedChats.lastMonth}
          label="Last 30 days"
          onDeleteChat={onDeleteChat}
          onSwitchChat={onSwitchChat}
        />
        <HistoryGroup
          activeChatId={activeChatId}
          actionId={actionId}
          chats={groupedChats.older}
          label="Older"
          onDeleteChat={onDeleteChat}
          onSwitchChat={onSwitchChat}
        />
        {hasMore && (
          <button className={styles.loadMoreHistory} type="button" onClick={onLoadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </button>
        )}
      </div>

      {showSideActions && (
        <div className={styles.sideActions}>
          <a href="tel:07902863999">
            <Phone size={16} aria-hidden="true" />
            Call Pathway
          </a>
          <Link href="/contact">
            <Calendar size={16} aria-hidden="true" />
            Contact page
          </Link>
        </div>
      )}
    </aside>
  );
}
