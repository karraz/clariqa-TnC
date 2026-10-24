import Link from "next/link";
import type { Metadata } from "next";
import { signIn } from "@/app/actions/auth";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Log in" };

type Props = { searchParams: Promise<{ next?: string; error?: string; message?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next = "", error, message } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-2 text-slate-600">Access your courses and materials.</p>
      <form action={signIn} className="card mt-6 space-y-4 p-6">
        <Flash error={error} message={message} />
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Logging in…">Log in</SubmitButton>
        <div className="flex justify-between text-sm">
          <Link href="/forgot-password" className="text-brand-600 hover:underline">Forgot password?</Link>
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-brand-600 hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
