import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileCheck,
  Gavel,
  Laptop,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";
import {
  GuestOnly,
  WorkspaceLink,
} from "@/components/public/PublicAuthActions";

const stages = [
  {
    title: "Stage 1 - Online Screening Round",
    description:
      "Problem statements will be published online. Participants will prepare and submit their solutions according to the instructions shared by the organizers. Submissions will be judged online, and shortlisted teams will move to the next stage.",
    icon: Laptop,
  },
  {
    title: "Stage 2 - 48-Hour Offline Hackathon",
    description:
      "Shortlisted teams will participate in the final 48-hour offline hackathon where they will build, improve, and present their working solutions under direct event supervision.",
    icon: Clock,
  },
];

const rules = [
  "Participants must register through the official HackSphere platform before the deadline.",
  "Each participant can belong to only one team.",
  "Team formation rules, minimum and maximum size, must be followed exactly as announced by organizers.",
  "Only shortlisted teams from the online stage will be eligible for the offline final stage.",
  "All submissions must be original work created by the participating team.",
  "Copied projects, plagiarism, or unfair external assistance may lead to direct disqualification.",
  "Teams must follow the submission format and deadlines announced on the platform.",
  "Judges' decisions during screening and final evaluation will be considered final.",
  "Participants must maintain professional and respectful conduct throughout the event.",
  "Any violation of rules, misconduct, or misuse of the platform may result in removal from the hackathon.",
];

const onlineRoundPoints = [
  "Problem statements will be released online.",
  "Teams must study the challenge carefully before submitting their solution or concept.",
  "Submission requirements may include project idea, approach, prototype, PPT, document, or supporting links as instructed.",
  "Judging in this round will happen online based on the submitted work.",
  "Results of the online round will be published online through the platform.",
];

const offlineRoundPoints = [
  "Only shortlisted teams will be invited to the final offline round.",
  "The final stage is a 48-hour offline hackathon.",
  "Teams are expected to work within the official event rules, venue timelines, and technical constraints.",
  "Participants may need to present demos, prototypes, or final solutions before judges.",
  "Final rankings will be based on evaluation criteria such as innovation, execution, impact, technical quality, and presentation.",
];

const conductRules = [
  {
    title: "Originality Required",
    text: "Every team must present original work. Reused, copied, or unfairly borrowed solutions may lead to disqualification.",
    icon: ShieldCheck,
  },
  {
    title: "Respect Deadlines",
    text: "Late submissions may not be considered unless organizers explicitly allow exceptions.",
    icon: FileCheck,
  },
  {
    title: "Professional Conduct",
    text: "All participants are expected to behave respectfully with teammates, judges, organizers, and fellow participants.",
    icon: Users,
  },
  {
    title: "Evaluation Integrity",
    text: "Judging decisions are based on the announced process and are treated as final.",
    icon: Gavel,
  },
];

export default function AboutHackathonPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#3B3C3E]">
      <PublicHeader /> 
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#A01C33]/10 bg-[#A01C33]/5 px-4 py-2 text-sm font-semibold text-[#A01C33]">
                About Hackathon | HackSphere Event Guide
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-[#1F2937] sm:text-5xl">
                Understand the structure, stages, and rules of HackSphere.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-[#5B6068] sm:text-lg">
                HackSphere is a structured hackathon experience organized in two
                stages. The first stage is conducted online for screening and
                shortlisting, while the second stage is a 48-hour offline
                hackathon for the final selected teams.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <GuestOnly>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5"
                  >
                    Register Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </GuestOnly>
                <WorkspaceLink className="inline-flex items-center rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5" />

                <Link
                  href="/problem-statements"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#3B3C3E] shadow-sm transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  Problem Statements
                  <BookOpen className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Hackathon Format</p>
                <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                  2-Stage Structure
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Online screening round followed by a 48-hour offline final round.
                </p>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Final Round</p>
                <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                  48 Hours Offline
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Shortlisted teams build and present under event supervision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
            Hackathon Stages
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
            Two-tier hackathon journey
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.title}
                className="rounded-[30px] border border-gray-200 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-[#202225]">
                  {stage.title}
                </h3>
                <p className="mt-4 text-sm leading-8 text-[#6B7280]">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[32px] border border-gray-200 bg-[#fcfcfd] p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                <Laptop className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#202225]">
                Stage 1 - Online Round
              </h2>
              <div className="mt-5 space-y-3">
                {onlineRoundPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm leading-7 text-[#5B6068]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-gray-200 bg-[#fcfcfd] p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                <MapPinned className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#202225]">
                Stage 2 - Offline Final Round
              </h2>
              <div className="mt-5 space-y-3">
                {offlineRoundPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm leading-7 text-[#5B6068]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
            General Rules
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
            Core rules for all participants
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {rules.map((rule, index) => (
            <div
              key={rule}
              className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-[#5B6068]">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
              Conduct & Evaluation
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
              What every participant must follow
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {conductRules.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-[#A01C33]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[#202225]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-8 py-12 text-white shadow-[0_24px_60px_rgba(160,28,51,0.24)] lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/75">
                Important Note
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                First perform well online, then compete offline.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
                HackSphere follows a clear selection structure. Teams must first
                qualify through the online stage before entering the 48-hour offline
                final hackathon.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <GuestOnly>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
                  >
                    Register Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </GuestOnly>
                <WorkspaceLink className="inline-flex items-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90" />

                <Link
                  href="/problem-statements"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  Problem Statements
                  <BookOpen className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Online Screening",
                  text: "Problem statements published online, submission collected online, judging online, results online.",
                  icon: FileCheck,
                },
                {
                  title: "Offline Final",
                  text: "Shortlisted teams enter the 48-hour offline build and presentation phase.",
                  icon: Clock,
                },
                {
                  title: "Final Recognition",
                  text: "Top-performing teams earn final rankings, visibility, and recognition.",
                  icon: Trophy,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/80">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </main>
  );
}
