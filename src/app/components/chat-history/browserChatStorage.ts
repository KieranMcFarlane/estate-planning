"use client";

import {
  ESTATE_CHAT_HISTORY_STORAGE_KEY,
  type EstateUIMessage,
} from "../../types/estate-chat";

const MAX_STORED_CHATS = 40;
const MAX_MESSAGES_PER_CHAT = 80;

export type StoredEstateChat = {
  id: string;
  title: string;
  sourcePage: string;
  createdAt: string;
  updatedAt: string;
  messages: EstateUIMessage[];
};

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function messageText(message: EstateUIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleFromMessages(messages: EstateUIMessage[]) {
  const firstUserText = messages.find((message) => message.role === "user");
  const title = firstUserText ? messageText(firstUserText) : "";
  if (!title) return "New conversation";
  return title.length > 52 ? `${title.slice(0, 49).trim()}...` : title;
}

function isStoredChat(value: unknown): value is StoredEstateChat {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<StoredEstateChat>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string" &&
    Array.isArray(candidate.messages)
  );
}

export function readStoredChats() {
  if (!hasLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(ESTATE_CHAT_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isStoredChat)
      .map((chat) => ({
        ...chat,
        sourcePage: chat.sourcePage || "/",
        messages: chat.messages.slice(-MAX_MESSAGES_PER_CHAT),
      }))
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  } catch {
    window.localStorage.removeItem(ESTATE_CHAT_HISTORY_STORAGE_KEY);
    return [];
  }
}

export function writeStoredChats(chats: StoredEstateChat[]) {
  if (!hasLocalStorage()) return;

  const safeChats = chats
    .filter((chat) => chat.messages.length > 0)
    .map((chat) => ({
      ...chat,
      messages: chat.messages.slice(-MAX_MESSAGES_PER_CHAT),
    }))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, MAX_STORED_CHATS);

  window.localStorage.setItem(ESTATE_CHAT_HISTORY_STORAGE_KEY, JSON.stringify(safeChats));
}

export function getStoredChat(chatId: string) {
  return readStoredChats().find((chat) => chat.id === chatId) ?? null;
}

export function saveStoredChat({
  id,
  messages,
  sourcePage,
}: {
  id: string;
  messages: EstateUIMessage[];
  sourcePage?: string;
}) {
  if (!messages.length) return readStoredChats();

  const now = new Date().toISOString();
  const current = readStoredChats();
  const existing = current.find((chat) => chat.id === id);
  const nextChat: StoredEstateChat = {
    id,
    title: titleFromMessages(messages),
    sourcePage: sourcePage || existing?.sourcePage || "/",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    messages: messages.slice(-MAX_MESSAGES_PER_CHAT),
  };
  const nextChats = [nextChat, ...current.filter((chat) => chat.id !== id)];
  writeStoredChats(nextChats);
  return nextChats;
}

export function deleteStoredChat(chatId: string) {
  const nextChats = readStoredChats().filter((chat) => chat.id !== chatId);
  writeStoredChats(nextChats);
  return nextChats;
}

export function deleteAllStoredChats() {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(ESTATE_CHAT_HISTORY_STORAGE_KEY);
}
