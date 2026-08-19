-- Dad's Medical Records — Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: tables/indexes use "if not exists"; policies are dropped
-- and recreated so re-running this script won't error.

-- ============================================================
-- 1. profiles: one row per family member who has redeemed an
--    invite (or is the owner). Presence in this table is what
--    grants access to every record in the app.
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Every "is this user a family member" RLS check below goes through this
-- function rather than inlining `auth.uid() in (select id from profiles)`.
-- That inline form is fine on OTHER tables, but profiles' own SELECT policy
-- can't query profiles from inside itself without SECURITY DEFINER — RLS
-- re-applies the calling policy to the subquery, which can make the check
-- fail to see a row that's actually there (looks like "no profile" in the
-- app, bouncing a real family member to the /invite screen). A
-- SECURITY DEFINER function sidesteps that recursion, so it's used
-- everywhere for consistency even though only the profiles policy strictly
-- needs it.
create or replace function public.is_family_member(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from profiles where id = uid);
$$;

drop policy if exists "profiles are visible to family members" on profiles;
create policy "profiles are visible to family members"
  on profiles for select
  using (is_family_member(auth.uid()));

drop policy if exists "users can insert their own profile" on profiles;
create policy "users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- ============================================================
-- 2. invite_codes: codes the owner generates and hands to a
--    family member. Redeeming one creates a profiles row.
-- ============================================================
create table if not exists invite_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_by uuid not null references auth.users (id),
  max_uses int not null default 1,
  uses int not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table invite_codes enable row level security;

drop policy if exists "family members manage invite codes" on invite_codes;
create policy "family members manage invite codes"
  on invite_codes for select
  using (is_family_member(auth.uid()));

drop policy if exists "family members create invite codes" on invite_codes;
create policy "family members create invite codes"
  on invite_codes for insert
  with check (is_family_member(auth.uid()));

-- Redemption (the update that increments `uses`) happens through the
-- /api/invite/redeem server route using the service role key, which
-- bypasses RLS by design — a brand-new user has no profiles row yet
-- and so could not update this table under RLS.

-- ============================================================
-- 3. doctors
-- ============================================================
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  hospital_or_clinic text,
  phone text,
  notes text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table doctors enable row level security;

drop policy if exists "family members full access to doctors" on doctors;
create policy "family members full access to doctors"
  on doctors for all
  using (is_family_member(auth.uid()))
  with check (is_family_member(auth.uid()));

-- ============================================================
-- 3b. doctor_assistants: a doctor can have more than one — each
--     row is one assistant's name/phone tied to a doctor.
-- ============================================================
create table if not exists doctor_assistants (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references doctors (id) on delete cascade,
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

alter table doctor_assistants enable row level security;

drop policy if exists "family members full access to doctor assistants" on doctor_assistants;
create policy "family members full access to doctor assistants"
  on doctor_assistants for all
  using (is_family_member(auth.uid()))
  with check (is_family_member(auth.uid()));

create index if not exists doctor_assistants_doctor_idx on doctor_assistants (doctor_id);

-- ============================================================
-- 4. documents: the core record — bills, prescriptions, test
--    reports, doctor's notes, discharge summaries.
-- ============================================================
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  doc_type text not null check (
    doc_type in ('bill', 'prescription', 'test_report', 'doctors_note', 'discharge_summary', 'other')
  ),
  doctor_id uuid references doctors (id) on delete set null,
  document_date date not null,
  conditions text[] not null default '{}', -- e.g. {cancer, uc, diabetes, ckd, general}
  summary text,
  amount numeric,
  file_path text not null, -- path inside the private "medical-documents" storage bucket
  file_name text not null,
  mime_type text,
  uploaded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table documents enable row level security;

drop policy if exists "family members full access to documents" on documents;
create policy "family members full access to documents"
  on documents for all
  using (is_family_member(auth.uid()))
  with check (is_family_member(auth.uid()));

create index if not exists documents_date_idx on documents (document_date desc);
create index if not exists documents_type_idx on documents (doc_type);
create index if not exists documents_doctor_idx on documents (doctor_id);
create index if not exists documents_conditions_idx on documents using gin (conditions);

-- ============================================================
-- 5. Storage bucket for the actual files (private — no public
--    access; every read goes through a short-lived signed URL
--    generated server-side after checking the user is a family
--    member).
-- ============================================================
insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do nothing;

drop policy if exists "family members read documents bucket" on storage.objects;
create policy "family members read documents bucket"
  on storage.objects for select
  using (bucket_id = 'medical-documents' and is_family_member(auth.uid()));

drop policy if exists "family members upload to documents bucket" on storage.objects;
create policy "family members upload to documents bucket"
  on storage.objects for insert
  with check (bucket_id = 'medical-documents' and is_family_member(auth.uid()));

drop policy if exists "family members delete from documents bucket" on storage.objects;
create policy "family members delete from documents bucket"
  on storage.objects for delete
  using (bucket_id = 'medical-documents' and is_family_member(auth.uid()));

-- ============================================================
-- 6. case_summary: an append-only log of AI-maintained "state of
--    Dad's case" summaries. Each regeneration inserts a new row
--    (from the "Update case summary" button); the app always reads
--    the most recent row as current. Keeping the history lets you
--    see how the summary evolved, and there's no update/delete
--    policy since it's meant to be a log, not an editable doc.
-- ============================================================
create table if not exists case_summary (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  updated_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table case_summary enable row level security;

drop policy if exists "family members read case summary" on case_summary;
create policy "family members read case summary"
  on case_summary for select
  using (is_family_member(auth.uid()));

drop policy if exists "family members write case summary" on case_summary;
create policy "family members write case summary"
  on case_summary for insert
  with check (is_family_member(auth.uid()));

create index if not exists case_summary_created_idx on case_summary (created_at desc);

-- ============================================================
-- 7. chat_messages: a single shared "Ask about Dad's case" thread
--    that the whole family sees and can add to. Append-only, like
--    case_summary.
-- ============================================================
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;

drop policy if exists "family members read chat messages" on chat_messages;
create policy "family members read chat messages"
  on chat_messages for select
  using (is_family_member(auth.uid()));

drop policy if exists "family members write chat messages" on chat_messages;
create policy "family members write chat messages"
  on chat_messages for insert
  with check (is_family_member(auth.uid()));

create index if not exists chat_messages_created_idx on chat_messages (created_at asc);

-- ============================================================
-- 8. Bootstrap: make yourself the owner after your first Google
--    sign-in. Sign in once through the app (you'll land on a
--    "waiting for invite" screen since you have no profile yet),
--    then run this (replace the email) so you have a profile to
--    start from. Every other family member is added via an
--    invite code you generate from the Settings page once you're in.
-- ============================================================
-- insert into profiles (id, email, role)
-- select id, email, 'owner'
-- from auth.users
-- where email = 'YOUR-EMAIL@gmail.com'
-- on conflict (id) do nothing;
