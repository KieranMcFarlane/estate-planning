import type { UIMessage } from "ai";

export type NavigationTarget = {
  title: string;
  url: string;
  summary: string;
  score?: number;
};

export type HandoffMetadata = {
  status?: "needs_details" | "created" | "skipped" | "failed";
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  crm?: {
    status?: "created" | "skipped" | "failed";
  };
};

export type ChatMetadataPart = {
  matchedRoutes?: string[];
  handoff?: HandoffMetadata | null;
  guardrails?: string[];
  navigation?: unknown;
  model?: unknown;
  error?: string;
  fallback?: boolean;
};

export type UIActionPart = {
  kind: "semantic-navigation";
  auto: boolean;
  targets: NavigationTarget[];
  query?: string;
};

export type SemanticNavigationSpotlightPayload = {
  title: string;
  summary: string;
  url: string;
  auto: boolean;
  highlight: string;
  query?: string;
  targets?: NavigationTarget[];
  currentIndex?: number;
};

export type EstateUIMessage = UIMessage<
  unknown,
  {
    "chat-metadata": ChatMetadataPart;
    "ui-action": UIActionPart;
  }
>;

export const CHAT_ID_PREFIX = "pathway_chat_";
export const MESSAGE_ID_PREFIX = "pathway_msg_";
export const ESTATE_CHAT_ID_STORAGE_KEY = "pathway-estate-chat-id";
export const ESTATE_CHAT_HISTORY_STORAGE_KEY = "pathway-estate-chat-history-v1";
export const SEMANTIC_NAVIGATION_SPOTLIGHT_EVENT = "pathway:semantic-navigation-spotlight";
export const SEMANTIC_NAVIGATION_SPOTLIGHT_STORAGE_KEY = "pathway-semantic-navigation-spotlight";

export function createClientChatId() {
  return `${CHAT_ID_PREFIX}${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
}
