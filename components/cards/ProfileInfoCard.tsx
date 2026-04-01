type ProfileField = {
  label: string;
  value: string;
};

type ProfileInfoCardProps = {
  title: string;
  subtitle?: string;
  fields: ProfileField[];
};

export default function ProfileInfoCard({
  title,
  subtitle,
  fields,
}: ProfileInfoCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_58%,#fff8f7_100%)] p-6 shadow-[0_18px_55px_rgba(103,40,55,0.08)] sm:p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(160,28,51,0.08),transparent_58%)]" />

      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f6b77]">
          Profile Ledger
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#26161d]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-6 text-[#7b646c]">{subtitle}</p>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="group rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5 shadow-[0_14px_30px_rgba(103,40,55,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(103,40,55,0.08)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9f6b77]">
                {field.label}
              </p>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#2e1f25]">
                {field.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
