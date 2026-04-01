import Link from "next/link";
import { ArrowRight, Home, LockKeyhole, ShieldAlert, UserCog } from "lucide-react";
import PublicAuthShell from "@/components/public/PublicAuthShell";

export default function UnauthorizedPage() {
  return (
    <PublicAuthShell
      eyebrow="Protected Access"
      title="You do not have permission to open this workspace."
      description="This route is available only to users with the required role, approval state, or event access level. Return to a valid route or sign in with the correct account."
      highlights={[
        {
          title: "Role-Aware Routing",
          text: "Participant, judge, and admin areas are intentionally separated so each workflow stays secure.",
          icon: UserCog,
        },
        {
          title: "Protected Operations",
          text: "Sensitive pages such as reviews, approvals, and publishing tools are restricted to the right users.",
          icon: LockKeyhole,
        },
        {
          title: "Safer Platform Access",
          text: "Clear access boundaries help keep submissions, evaluations, and event operations trustworthy.",
          icon: ShieldAlert,
        },
      ]}
    >
      <div className="w-full max-w-lg rounded-[30px] border border-[#eadfe3] bg-white/92 p-8 text-center shadow-[0_16px_48px_rgba(74,36,48,0.08)] sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#A01C33]/10 text-[#A01C33]">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="mt-6 inline-flex items-center rounded-full border border-[#ead7de] bg-[#fff6f4] px-4 py-2 text-sm font-semibold text-[#9a6773]">
          Access Restricted
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#1f2937]">
          Access Denied
        </h1>
        <p className="mt-4 text-base leading-7 text-gray-500">
          You do not currently have permission to access this page. Use a route
          that matches your role or return to a public page.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Common reason
            </p>
            <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
              Wrong role or pending approval state
            </p>
          </div>

          <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Recommended action
            </p>
            <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
              Go back home or sign in with the correct account
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </PublicAuthShell>
  );
}
