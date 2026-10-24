-- Clariqa Training & Consultancy — initial schema
-- Run in the Supabase SQL editor or with `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  full_name    text,
  phone        text,
  organisation text,
  role         text not null default 'student' check (role in ('student', 'admin')),
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, organisation)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'organisation'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  category       text not null default 'Statistics',
  summary        text,
  description_md text,
  price_myr      numeric(10, 2) not null default 0,
  start_date     date,
  end_date       date,
  mode           text not null default 'online' check (mode in ('online', 'physical', 'hybrid')),
  venue          text,
  seats          integer,
  cover_url      text,
  status         text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Enrollments (one per user per course; carries payment status)
-- ---------------------------------------------------------------------------
create table public.enrollments (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  course_id             uuid not null references public.courses (id) on delete cascade,
  payment_status        text not null default 'pending'
                        check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method        text,
  amount_myr            numeric(10, 2) not null default 0,
  stripe_session_id     text,
  stripe_payment_intent text,
  paid_at               timestamptz,
  created_at            timestamptz not null default now(),
  unique (user_id, course_id)
);

create index enrollments_course_idx on public.enrollments (course_id);
create index enrollments_status_idx on public.enrollments (payment_status);

-- Paid seats per course, readable by anyone (no personal data exposed).
create or replace function public.seats_taken(p_course_id uuid)
returns integer
language sql
stable
security definer set search_path = public
as $$
  select count(*)::int from public.enrollments
  where course_id = p_course_id and payment_status = 'paid';
$$;

-- ---------------------------------------------------------------------------
-- Course materials (files live in the private `course-materials` bucket)
-- ---------------------------------------------------------------------------
create table public.materials (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null,
  description  text,
  file_path    text,
  external_url text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index materials_course_idx on public.materials (course_id);

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body_md      text,
  cover_url    text,
  tags         text[] not null default '{}',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Contact / in-house training enquiries
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  phone        text,
  organisation text,
  topic        text,
  message      text not null,
  handled      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.courses     enable row level security;
alter table public.enrollments enable row level security;
alter table public.materials   enable row level security;
alter table public.posts       enable row level security;
alter table public.enquiries   enable row level security;

-- profiles: users see and edit their own row (but not their role); admins see all
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy "profiles admin all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- courses: public reads published/closed; admins manage
create policy "courses public read" on public.courses
  for select using (status in ('published', 'closed') or public.is_admin());
create policy "courses admin write" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

-- enrollments: students read their own; all writes go through the server (service role)
create policy "enrollments self read" on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy "enrollments admin write" on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- materials: only students with a PAID enrollment for the course (or admins)
create policy "materials paid read" on public.materials
  for select using (
    public.is_admin() or exists (
      select 1 from public.enrollments e
      where e.course_id = materials.course_id
        and e.user_id = auth.uid()
        and e.payment_status = 'paid'
    )
  );
create policy "materials admin write" on public.materials
  for all using (public.is_admin()) with check (public.is_admin());

-- posts: public reads published; admins manage
create policy "posts public read" on public.posts
  for select using (status = 'published' or public.is_admin());
create policy "posts admin write" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: anyone may submit; only admins read/manage
create policy "enquiries public insert" on public.enquiries
  for insert with check (true);
create policy "enquiries admin all" on public.enquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', false),
       ('public-images', 'public-images', true)
on conflict (id) do nothing;

-- Materials are uploaded and signed server-side with the service role, so the
-- private bucket needs no policies for students. Admins may also manage it directly.
create policy "materials bucket admin" on storage.objects
  for all using (bucket_id = 'course-materials' and public.is_admin())
  with check (bucket_id = 'course-materials' and public.is_admin());

create policy "public images read" on storage.objects
  for select using (bucket_id = 'public-images');
create policy "public images admin write" on storage.objects
  for all using (bucket_id = 'public-images' and public.is_admin())
  with check (bucket_id = 'public-images' and public.is_admin());
