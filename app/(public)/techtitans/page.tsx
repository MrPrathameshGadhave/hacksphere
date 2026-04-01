import Link from "next/link";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Cpu,
  GanttChartSquare,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/PublicHeader";

const pillars = [
  {
    title: "Event Planning",
    text: "Tech Titans defines the structure, flow, timeline, and experience strategy that turns HackSphere into a professional college hackathon.",
    icon: GanttChartSquare,
  },
  {
    title: "Technical Execution",
    text: "From platform workflows to participant movement and digital event operations, the club powers the technical backbone of the event.",
    icon: Cpu,
  },
  {
    title: "Student Leadership",
    text: "Tech Titans is driven by student leaders who take ownership of communication, coordination, and full-event execution.",
    icon: Users,
  },
  {
    title: "Innovation Culture",
    text: "The club promotes a mindset of building, experimentation, real problem-solving, and stronger technical standards on campus.",
    icon: Lightbulb,
  },
];

const responsibilities = [
  {
    title: "Planning the Event",
    text: "Defining the event format, structure, branding, execution model, and participant experience for HackSphere.",
    icon: Target,
  },
  {
    title: "Managing Registrations",
    text: "Handling participant onboarding, registration flow, communication, and access readiness.",
    icon: Bell,
  },
  {
    title: "Coordinating Teams",
    text: "Ensuring teams are formed properly, aligned to the rules, and prepared for the challenge workflow.",
    icon: Handshake,
  },
  {
    title: "Curating Problem Statements",
    text: "Designing and selecting meaningful, relevant, and innovation-driven problem statements for participants.",
    icon: BookOpen,
  },
  {
    title: "Supporting Judging Flow",
    text: "Organizing expert judges, evaluation stages, scoring visibility, and fair review structure.",
    icon: ShieldCheck,
  },
  {
    title: "Publishing Results",
    text: "Delivering official announcements, shortlisted teams, and final results with clarity and professionalism.",
    icon: Trophy,
  },
];

const values = [
  "Ownership over execution",
  "Innovation-first mindset",
  "Student-led professionalism",
  "Strong technical culture",
  "Discipline in coordination",
  "Visibility for student talent",
];

const highlights = [
  {
    title: "Built by students",
    text: "A club-led initiative where students are not just participants, but organizers and executors.",
    icon: GraduationCap,
  },
  {
    title: "Focused on real impact",
    text: "Tech Titans believes technical events should create real learning, real building, and real recognition.",
    icon: Rocket,
  },
  {
    title: "Identity behind HackSphere",
    text: "HackSphere reflects the discipline, ambition, and creative force of Tech Titans Technical Club.",
    icon: Sparkles,
  },
];

export default function TechTitansPage() {
  return (
    <main className="min-h-screen bg-[#F6F7FB] text-[#3B3C3E]">
        <PublicHeader />
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#A01C33]/10 bg-[#A01C33]/5 px-4 py-2 text-sm font-semibold text-[#A01C33]">
                Tech Titans | Organizing Club
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-[#1F2937] sm:text-5xl">
                Tech Titans Technical Club of DPGU
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-[#5B6068] sm:text-lg">
                Tech Titans is the organizing force behind HackSphere. The club
                brings planning, technical execution, coordination, leadership,
                and innovation culture together to create a premium hackathon
                experience for students.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A01C33] to-[#7e1428] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(160,28,51,0.22)] transition hover:-translate-y-0.5"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-[#3B3C3E] shadow-sm transition hover:border-[#A01C33] hover:text-[#A01C33]"
                >
                  About Hackathon
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Club Role</p>
                <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                  Lead Organizer
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  Tech Titans leads the identity, planning, and execution of the
                  complete HackSphere event.
                </p>
              </div>

              <div className="rounded-[28px] border border-gray-200 bg-[#fcfcfd] p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Focus</p>
                <h3 className="mt-2 text-2xl font-bold text-[#3B3C3E]">
                  Innovation + Execution
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  The club combines technical thinking, leadership, and event
                  management into one strong student-driven force.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
            Core Pillars
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
            What defines Tech Titans
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
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
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
                Club Vision
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
                Building a stronger technical ecosystem on campus
              </h2>
              <p className="mt-5 text-base leading-8 text-[#5B6068]">
                Tech Titans is more than an organizing club. It is a student-led
                technical identity that aims to create stronger builders,
                stronger teams, stronger execution, and better event culture
                across the campus ecosystem.
              </p>
              <p className="mt-4 text-base leading-8 text-[#5B6068]">
                Through HackSphere, the club showcases how student leadership
                can deliver a professional, structured, and ambitious technical
                event experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {values.map((value, index) => (
                <div
                  key={value}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5 shadow-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-[#202225]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
            What Tech Titans Handles
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
            Responsibilities behind HackSphere
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {responsibilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
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
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
              Club Highlights
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#202225] sm:text-4xl">
              Why Tech Titans matters to HackSphere
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => {
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
                Built With Ownership
              </p>
              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                HackSphere reflects the hard work of Tech Titans.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
                From event planning to execution and final result visibility,
                Tech Titans shapes the complete hackathon experience with strong
                ownership, technical focus, and student leadership.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
                >
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                >
                  About Hackathon
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Club-led system thinking",
                  text: "Tech Titans treats the hackathon as a complete product and event ecosystem.",
                  icon: Sparkles,
                },
                {
                  title: "Visible execution quality",
                  text: "HackSphere is designed to look professional because the organizing standard is high.",
                  icon: ShieldCheck,
                },
                {
                  title: "Real student impact",
                  text: "The club creates opportunities for students to build, compete, and gain recognition.",
                  icon: Rocket,
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
