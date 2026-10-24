# Clariqa Training & Consultancy: website & learning portal

Public website, online course registration with payment, a student portal and an admin portal for
**Clariqa Training & Consultancy** (SPSS, statistics, R, Python, Excel, Power BI and AI for data analysis).

Built with **Next.js 15** (App Router, TypeScript, Tailwind CSS), **Supabase** (Postgres, Auth, Storage, Row Level Security) and **Stripe Checkout** (FPX online banking, cards and GrabPay, in MYR).

## Features

| Area | What it does |
|---|---|
| Public site | Home, upcoming courses with a category filter, course detail with seats left, blog, about, contact / in-house training enquiry |
| Registration & payment | "Enrol & pay" creates a *pending* registration and sends the student to Stripe Checkout. A webhook marks it *paid* (or *failed*). FPX settles asynchronously, and that case is handled. |
| Student portal `/dashboard` | My courses with payment status, "complete payment" for pending ones, course materials (download only after paying), profile and password |
| Admin portal `/admin` | KPI cards (revenue, paid, pending, upcoming), charts (paid vs pending per upcoming course, revenue by month, paid students by category), latest registrations |
| Admin: courses | Create, edit, publish or close courses; cover image; participant list with **Mark paid / refunded**; add participants manually (bank transfer, HRD Corp, purchase order); **CSV export** |
| Admin: materials | Upload files (PDF, slides, datasets, syntax) or add links per course, reorder, delete. Files sit in a private bucket and are served through 5-minute signed URLs, only to paid students. |
| Admin: blog | Markdown editor with preview, tags, cover image, draft or published |
| Admin: students / enquiries | Search and filter every registration by status; contact-form inbox |

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Create a project at <https://supabase.com>. The Singapore region is closest to Malaysia.
2. **SQL Editor**: run `supabase/migrations/0001_init.sql`, then (optionally) `supabase/seed.sql` for sample courses and posts.
3. **Project Settings → API**: copy the URL, the `anon` key and the `service_role` key into `.env.local`.
4. **Authentication → URL Configuration**: set the Site URL to your domain and add `https://your-domain/auth/callback` as a redirect URL.
5. Register on the site, then make yourself an admin in the SQL editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

### 3. Stripe

1. Create a Stripe account for your Malaysian business. In **Settings → Payment methods**, enable **FPX**, Cards and (optionally) GrabPay. Checkout shows whatever is enabled there.
2. Put the secret key in `STRIPE_SECRET_KEY`.
3. Webhook. Locally:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints whsec_… → STRIPE_WEBHOOK_SECRET
   ```

   In production, add an endpoint at `https://your-domain/api/stripe/webhook` with these events:
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm test           # unit tests (webhook → enrollment status logic)
npm run lint && npm run typecheck && npm run build
```

Without Supabase keys the site still runs in **demo mode** (public pages render, and protected pages redirect to login).

### 5. Deploy

Push to GitHub and import the repo in **Vercel**. Add the same environment variables there, with `NEXT_PUBLIC_SITE_URL` set to your domain. Then point the Stripe webhook and the Supabase redirect URL at that domain.

## How payment status works

```
Enrol & pay ──► enrollment (pending) ──► Stripe Checkout ──► webhook
                                                          ├─ card: checkout.session.completed (paid)  ─► paid
                                                          ├─ FPX: async_payment_succeeded             ─► paid
                                                          └─ FPX: async_payment_failed                ─► failed
Admin "Mark paid" (bank transfer / HRD Corp) ─────────────────────────────────────────────────────────► paid
```

The webhook never overwrites an enrollment that is already paid, so duplicate or late events are safe.

## Project structure

```
src/app/(public)/        public pages (home, courses, blog, about, contact, login, register, checkout)
src/app/dashboard/       student portal
src/app/admin/           admin portal
src/app/actions/         server actions (auth, checkout, admin, profile, enquiry)
src/app/api/stripe/webhook/route.ts
src/lib/                 Supabase clients, auth guards, Stripe, payment logic, dashboard stats
src/components/          UI, charts, forms
supabase/                SQL migration and seed data
.claude/agents/          AI agent team definitions for extending this project
```

## Roadmap ideas

- PDF certificates of completion and attendance tracking
- Early-bird and promo codes (Stripe coupons), group registration
- Email reminders (e.g. Resend) and a WhatsApp click-to-chat button
- Recorded video lessons, quizzes, course feedback shown as testimonials
- Bahasa Melayu / English toggle, newsletter
