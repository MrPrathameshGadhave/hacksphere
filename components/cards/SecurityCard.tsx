import { KeyRound, ShieldCheck } from "lucide-react";

type SecurityCardProps = {
  roleLabel: string;
  accessText: string;
};

export default function SecurityCard({
  roleLabel,
  accessText,
}: SecurityCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_58%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(160,28,51,0.08),transparent_58%)]" />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
          Security Posture
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
          Security & Access
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7b646c]">
          Account permissions, role visibility, and recovery guidance.
        </p>

        <div className="mt-6 space-y-4">
          <div className="group rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[0_14px_30px_rgba(103,40,55,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(103,40,55,0.08)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#2e1f25]">Current Role</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5b62]">{roleLabel}</p>
              </div>
            </div>
          </div>

          <div className="group rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[0_14px_30px_rgba(103,40,55,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(103,40,55,0.08)]">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#2e1f25]">Access Scope</h3>
                <p className="mt-2 text-sm leading-6 text-[#6f5b62]">{accessText}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-dashed border-[#d9b6c0] bg-[linear-gradient(135deg,rgba(160,28,51,0.04)_0%,rgba(255,255,255,0.9)_100%)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
              Account Recovery
            </p>
            <p className="mt-3 text-sm leading-7 text-[#4d3d43]">
              Keep your email address current from the profile editor. If you lose
              access to your account, use the Forgot Password flow from the sign-in
              page to reset your credentials securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
