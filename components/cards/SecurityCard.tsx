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
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
      <h2 className="text-2xl font-bold text-[#3B3C3E]">Security & Access</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        Account role visibility and security-related actions.
      </p>

      <div className="mt-6 space-y-4">
        <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#3B3C3E]">Current Role</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{roleLabel}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#3B3C3E]">Access Scope</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">{accessText}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
          <p className="text-sm font-medium text-[#A01C33]">Later dynamic feature</p>
          <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
            This section can later include change password, device sessions, and
            recent login activity.
          </p>
        </div>
      </div>
    </div>
  );
}