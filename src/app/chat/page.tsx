import ChatPageClient from "./ChatPageClient";

type ChatPageProps = {
  searchParams?: Promise<{
    id?: string;
  }>;
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = await searchParams;
  return <ChatPageClient initialChatId={params?.id ?? ""} />;
}
