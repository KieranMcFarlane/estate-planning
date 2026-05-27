"use client";

import { useCallback, useMemo, useState } from "react";
import { createClientChatId, ESTATE_CHAT_ID_STORAGE_KEY } from "../../types/estate-chat";
import {
  deleteAllStoredChats,
  deleteStoredChat,
  getStoredChat,
  readStoredChats,
  saveStoredChat,
  type StoredEstateChat,
} from "./browserChatStorage";

export type ChatSummary = {
  id: string;
  title: string;
  sourcePage: string;
  createdAt: string;
  updatedAt: string;
};

export type GroupedChats = {
  today: ChatSummary[];
  yesterday: ChatSummary[];
  lastWeek: ChatSummary[];
  lastMonth: ChatSummary[];
  older: ChatSummary[];
};

type UseEstateChatHistoryOptions = {
  activeChatId: string;
  onCreateChat: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function groupChatsByDate(chats: ChatSummary[]): GroupedChats {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setDate(lastMonth.getDate() - 30);

  return chats.reduce<GroupedChats>(
    (groups, chat) => {
      const updatedAt = new Date(chat.updatedAt);
      if (updatedAt >= today) groups.today.push(chat);
      else if (updatedAt >= yesterday) groups.yesterday.push(chat);
      else if (updatedAt >= lastWeek) groups.lastWeek.push(chat);
      else if (updatedAt >= lastMonth) groups.lastMonth.push(chat);
      else groups.older.push(chat);
      return groups;
    },
    { today: [], yesterday: [], lastWeek: [], lastMonth: [], older: [] },
  );
}

export function useEstateChatHistory({
  activeChatId,
  onCreateChat,
  onSelectChat,
}: UseEstateChatHistoryOptions) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const refreshFromStorage = useCallback(() => {
    const storedChats = readStoredChats();
    setChats(storedChats.map(({ messages: _messages, ...chat }) => chat));
    setHasMore(false);
    return storedChats;
  }, []);

  const loadHistory = useCallback(async (options: { reset?: boolean } = {}) => {
    setIsLoading(true);
    setError("");
    window.setTimeout(() => {
      refreshFromStorage();
      setIsLoading(false);
    }, options.reset ? 0 : 80);
  }, [refreshFromStorage]);

  const createAndSelectChat = useCallback(() => {
    const nextChatId = createClientChatId();
    window.localStorage.setItem(ESTATE_CHAT_ID_STORAGE_KEY, nextChatId);
    onCreateChat(nextChatId);
    return nextChatId;
  }, [onCreateChat]);

  const startNewChat = useCallback(() => {
    createAndSelectChat();
  }, [createAndSelectChat]);

  const switchChat = useCallback(
    (nextChatId: string) => {
      window.localStorage.setItem(ESTATE_CHAT_ID_STORAGE_KEY, nextChatId);
      onSelectChat(nextChatId);
    },
    [onSelectChat],
  );

  const deleteChat = useCallback(
    async (targetChatId: string) => {
      setActionId(targetChatId);
      try {
        const nextChats = deleteStoredChat(targetChatId);
        setChats(nextChats.map(({ messages: _messages, ...chat }) => chat));
        if (targetChatId === activeChatId) createAndSelectChat();
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "The chat could not be deleted.");
      } finally {
        setActionId(null);
      }
    },
    [activeChatId, createAndSelectChat, loadHistory],
  );

  const deleteAllChats = useCallback(async () => {
    setActionId("all");
    try {
      deleteAllStoredChats();
      setChats([]);
      setHasMore(false);
      createAndSelectChat();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The chat history could not be cleared.");
    } finally {
      setActionId(null);
    }
  }, [createAndSelectChat]);

  const saveChat = useCallback(
    (chat: { id: string; messages: StoredEstateChat["messages"]; sourcePage?: string }) => {
      const nextChats = saveStoredChat(chat);
      setChats(nextChats.map(({ messages: _messages, ...summary }) => summary));
    },
    [],
  );

  const getChatMessages = useCallback((targetChatId: string) => getStoredChat(targetChatId)?.messages ?? [], []);

  const groupedChats = useMemo(() => groupChatsByDate(chats), [chats]);

  return {
    chats,
    groupedChats,
    hasMore,
    error,
    isLoading,
    actionId,
    loadHistory,
    getChatMessages,
    saveChat,
    startNewChat,
    switchChat,
    deleteChat,
    deleteAllChats,
  };
}
