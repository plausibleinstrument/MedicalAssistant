import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function Nav() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold text-brand-700">
          Dad&apos;s Medical Records
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/dashboard" className="text-stone-600 hover:text-stone-900">
            Records
          </Link>
          <Link href="/documents/new" className="text-stone-600 hover:text-stone-900">
            Add
          </Link>
          <Link href="/doctors" className="text-stone-600 hover:text-stone-900">
            Doctors
          </Link>
          <Link href="/prep" className="text-stone-600 hover:text-stone-900">
            Prep for Visit
          </Link>
          <Link href="/settings" className="text-stone-600 hover:text-stone-900">
            Settings
          </Link>
          {user && (
            <span className="hidden text-stone-400 sm:inline">{user.email}</span>
          )}
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
