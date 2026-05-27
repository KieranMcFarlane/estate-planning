import ChatPageClient from "../ChatPageClient";

type ChatSessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { id } = await params;
  return <ChatPageClient initialChatId={id} />;
}
