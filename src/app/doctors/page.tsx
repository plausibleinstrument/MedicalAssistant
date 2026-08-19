import Nav from "@/components/Nav";
import DoctorForm from "@/components/DoctorForm";
import AssistantManager from "@/components/AssistantManager";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Doctor } from "@/lib/types";

export default async function DoctorsPage() {
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

  const { data: doctors } = await supabase
    .from("doctors")
    .select("*, doctor_assistants(*)")
    .order("name");

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Doctors</h1>
        </div>
        <DoctorForm />
        <div className="space-y-2">
          {(doctors as Doctor[] | null)?.map((d) => (
            <div key={d.id} className="card">
              <h3 className="font-medium">{d.name}</h3>
              <p className="text-sm text-stone-500">
                {[d.specialty, d.hospital_or_clinic].filter(Boolean).join(" · ")}
              </p>
              {d.phone && <p className="text-sm text-stone-400">{d.phone}</p>}
              <AssistantManager doctorId={d.id} assistants={d.doctor_assistants || []} />
            </div>
          ))}
          {doctors && doctors.length === 0 && (
            <p className="py-8 text-center text-sm text-stone-400">No doctors added yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
