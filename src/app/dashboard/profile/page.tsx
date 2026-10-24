import { changePassword, updateProfile } from "@/app/actions/profile";
import { Flash } from "@/components/flash";
import { SubmitButton } from "@/components/submit-button";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ user, profile }, { saved, error }] = await Promise.all([requireUser(), searchParams]);
  return (
    <>
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="mt-6 max-w-xl space-y-6">
        <Flash error={error} message={saved ? "Saved." : undefined} />
        <form action={updateProfile} className="card space-y-4 p-6">
          <div>
            <label className="label">Email</label>
            <input className="input bg-slate-50" value={user.email ?? ""} disabled />
          </div>
          <div>
            <label className="label" htmlFor="full_name">Full name</label>
            <input className="input" id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input className="input" id="phone" name="phone" defaultValue={profile?.phone ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="organisation">Organisation</label>
              <input className="input" id="organisation" name="organisation" defaultValue={profile?.organisation ?? ""} />
            </div>
          </div>
          <SubmitButton>Save profile</SubmitButton>
        </form>
        <form action={changePassword} className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="password">New password</label>
            <input className="input" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          </div>
          <SubmitButton className="btn-outline">Change password</SubmitButton>
        </form>
      </div>
    </>
  );
}
