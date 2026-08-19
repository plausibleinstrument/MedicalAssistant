import Nav from "@/components/Nav";
import ChatView from "@/components/ChatView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatMessage } from "@/lib/types";

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

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-1 text-lg font-semibold">Ask about Dad&apos;s case</h1>
        <p className="mb-4 text-sm text-stone-500">
          A shared thread the whole family can use — ask anything about his records, and Claude
          answers from the case summary and everything on file. Not medical advice.
        </p>
        <ChatView initialMessages={(messages as ChatMessage[]) || []} currentUserId={user.id} />
      </main>
    </div>
  );
}
