import Link from "next/link";
import type { Metadata } from "next";
import { signUp } from "@/app/actions/auth";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Create an account" };

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next = "/dashboard", error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-slate-600">You need an account to enrol and access course materials.</p>
      <form action={signUp} className="card mt-6 space-y-4 p-6">
        <Flash error={error} />
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="full_name">Full name</label>
          <input className="input" id="full_name" name="full_name" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input className="input" id="phone" name="phone" autoComplete="tel" />
          </div>
          <div>
            <label className="label" htmlFor="organisation">Organisation</label>
            <input className="input" id="organisation" name="organisation" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Creating account…">Create account</SubmitButton>
        <p className="text-center text-sm">
          Already registered?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-brand-600 hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
