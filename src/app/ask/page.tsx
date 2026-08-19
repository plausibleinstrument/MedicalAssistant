import Nav from "@/components/Nav";
import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatMessage } from "@/lib/types";
import { getStrings } from "@/lib/strings";

export default async function AskPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/invite");

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true });
  const t = await getStrings();

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">{t.askTitle}</h1>
        <p className="mb-4 text-sm text-stone-500">{t.askDescription}</p>
        <ChatView initialMessages={(messages as ChatMessage[]) || []} currentUserId={user.id} t={t} />
      </main>
    </div>
  );
}
