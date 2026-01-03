-- Enable extensions ---------------------------------------------------------
create extension if not exists "uuid-ossp";

-- Profiles ------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text check (role in ('student', 'mentor')),
  headline text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Mentorship sessions -------------------------------------------------------
create table if not exists public.mentorship_sessions (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  duration_minutes integer,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete cascade,
  summary text
);

-- Session participants (table must exist before any policies reference it) -----
create table if not exists public.session_participants (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.mentorship_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'mentor')),
  joined_at timestamptz not null default now(),
  unique (session_id, user_id)
);

alter table public.mentorship_sessions enable row level security;

create policy "Mentors can insert sessions"
  on public.mentorship_sessions
  for insert
  with check (
    auth.uid() = created_by
  );

create policy "Users can view their sessions"
  on public.mentorship_sessions
  for select
  using (
    exists (
      select 1 from public.session_participants sp
      where sp.session_id = mentorship_sessions.id
        and sp.user_id = auth.uid()
    )
    or created_by = auth.uid()
  );

create policy "Creators can update sessions"
  on public.mentorship_sessions
  for update
  using (auth.uid() = created_by);

alter table public.session_participants enable row level security;

create policy "Participants can view roster"
  on public.session_participants
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.session_participants sp2
      where sp2.session_id = session_participants.session_id
        and sp2.user_id = auth.uid()
    )
  );

create policy "Creators can manage roster"
  on public.session_participants
  for all
  using (
    exists (
      select 1 from public.mentorship_sessions ms
      where ms.id = session_participants.session_id
        and ms.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.mentorship_sessions ms
      where ms.id = session_participants.session_id
        and ms.created_by = auth.uid()
    )
  );

-- Session chat messages ------------------------------------------------------
create table if not exists public.session_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.mentorship_sessions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists session_messages_session_idx on public.session_messages (session_id, created_at);

alter table public.session_messages enable row level security;

create policy "Participants can read chat"
  on public.session_messages
  for select
  using (
    exists (
      select 1 from public.session_participants sp
      where sp.session_id = session_messages.session_id
        and sp.user_id = auth.uid()
    )
  );

create policy "Participants can send chat"
  on public.session_messages
  for insert
  with check (
    exists (
      select 1 from public.session_participants sp
      where sp.session_id = session_messages.session_id
        and sp.user_id = auth.uid()
    )
    and auth.uid() = author_id
  );

-- Session code snapshots -----------------------------------------------------
create table if not exists public.session_code_snapshots (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.mentorship_sessions(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'javascript',
  code text not null,
  created_at timestamptz not null default now()
);

create index if not exists session_code_snapshots_session_idx on public.session_code_snapshots (session_id, created_at);

alter table public.session_code_snapshots enable row level security;

create policy "Participants can read code history"
  on public.session_code_snapshots
  for select
  using (
    exists (
      select 1 from public.session_participants sp
      where sp.session_id = session_code_snapshots.session_id
        and sp.user_id = auth.uid()
    )
  );

create policy "Participants can push code"
  on public.session_code_snapshots
  for insert
  with check (
    exists (
      select 1 from public.session_participants sp
      where sp.session_id = session_code_snapshots.session_id
        and sp.user_id = auth.uid()
    )
    and auth.uid() = author_id
  );

-- Storage bucket -------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('session-artifacts', 'session-artifacts', false)
  on conflict (id) do nothing;

create policy "Participants can read artifacts"
  on storage.objects for select
  using (
    bucket_id = 'session-artifacts'
    and exists (
      select 1 from public.session_participants sp
      where sp.session_id = (storage.foldername(name))[1]::uuid
        and sp.user_id = auth.uid()
    )
  );

create policy "Participants can upload artifacts"
  on storage.objects for insert
  with check (
    bucket_id = 'session-artifacts'
    and owner = auth.uid()
  );
