import Link from "next/link";
import { Code2, type LucideIcon } from "lucide-react";

type Highlight = {
  title: string;
  text: string;
  icon: LucideIcon;
};

type PublicAuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  highlights: Highlight[];
  children: React.ReactNode;
};

export default function PublicAuthShell({
  eyebrow,
  title,
  description,
  highlights,
  children,
}: PublicAuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffdf8_0%,#fff6f3_50%,#f8f2f4_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-[#f7dfe3] blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#fde7db] blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-[#eadfe3] bg-white/75 shadow-[0_32px_90px_rgba(74,36,48,0.14)] backdrop-blur-xl">
        <section className="relative hidden w-[47%] overflow-hidden border-r border-[#efe3e7] bg-[linear-gradient(180deg,#fffaf8_0%,#fff3f1_50%,#fffaf7_100%)] lg:flex">
          <div className="pointer-events-none absolute -left-12 top-0 h-48 w-48 rounded-full bg-[#f7d9e1] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#f9e5d7] blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between px-10 py-12 xl:px-14">
            <div>
              <Link href="/" className="inline-flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#a01c33_0%,#7e1428_100%)] text-white shadow-[0_18px_36px_rgba(160,28,51,0.2)]">
                  <Code2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-[#26161d]">
                    HackSphere
                  </h1>
                  <p className="mt-1 text-sm text-[#7a646b]">
                    Organized by TechTitans Club
                  </p>
                </div>
              </Link>
            </div>

            <div className="max-w-xl">
              {eyebrow ? (
                <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-white/80 px-4 py-2 text-sm font-semibold text-[#9a6773]">
                  {eyebrow}
                </div>
              ) : null}

              <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#26161d] xl:text-5xl">
                {title}
              </h2>

              <p className="mt-6 text-lg leading-8 text-[#6f5b62]">
                {description}
              </p>

              <div className="mt-8 grid gap-4">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[24px] border border-[#eadfe3] bg-white/80 p-5 shadow-[0_14px_32px_rgba(74,36,48,0.06)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#2e1f25]">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-7 text-[#6f5b62]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a6773]">
              HackSphere | TechTitans | College Innovation Platform
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,#fffefd_0%,#fff9f7_100%)] px-4 py-8 sm:px-8 lg:px-12">
          {children}
        </section>
      </div>
    </main>
  );
}
