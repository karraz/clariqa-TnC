import type { Metadata } from "next";
import { requestPasswordReset } from "@/app/actions/auth";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const { sent, error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">Reset your password</h1>
      <form action={requestPasswordReset} className="card mt-6 space-y-4 p-6">
        <Flash error={error} message={sent ? "If that email is registered, a reset link is on its way." : undefined} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <SubmitButton className="btn-primary w-full">Send reset link</SubmitButton>
      </form>
    </div>
  );
}
