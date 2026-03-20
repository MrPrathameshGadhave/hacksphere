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
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
      <div>
        <h2 className="text-2xl font-bold text-[#3B3C3E]">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm leading-6 text-gray-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {field.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#3B3C3E]">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}