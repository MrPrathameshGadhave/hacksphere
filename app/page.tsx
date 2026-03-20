import Image from 'next/image';
import ttlogo from './utils/tt.jpeg';
import dpgulogo from './utils/dpgu.jpeg';
import PublicHeader from "@/components/layout/PublicHeader";
export default function HackSphereLandingPage() {
  const stats = [
    { value: '48', label: 'Hours' },
    { value: '500+', label: 'Student Innovators' },
    { value: '20+', label: 'Problem Statements' },
    { value: '25+', label: 'Expert Judges' },
  ];

  const techTitansValues = [
    {
      title: 'Event Planning',
      text: 'Structured scheduling, milestone tracking, and full-scale coordination that turns ideas into a flagship college tech event.',
    },
    {
      title: 'Technical Execution',
      text: 'From the digital platform to participant workflows, Tech Titans manages the operational engine behind HackSphere.',
    },
    {
      title: 'Student Leadership',
      text: 'Driven by student leaders who take ownership of communication, organization, and the complete hackathon experience.',
    },
    {
      title: 'Innovation Culture',
      text: 'A community built around solving real problems, encouraging bold thinking, and raising the standard of technical events.',
    },
  ];

  const hacksphereFeatures = [
    'Participant registration',
    'Team creation and collaboration',
    'Problem statement access',
    'Project submission workflow',
    'Judge evaluation dashboards',
    'Live announcements and updates',
    'Leaderboard and result visibility',
  ];

  const joinBenefits = [
    {
      title: 'Build Real Projects',
      text: 'Convert ideas into working solutions under the pressure and excitement of a real hackathon environment.',
    },
    {
      title: 'Solve Impactful Problems',
      text: 'Work on meaningful challenges that test creativity, technical skill, and problem-solving ability.',
    },
    {
      title: 'Collaborate in Teams',
      text: 'Form strong teams, distribute roles smartly, and learn how great products are built together.',
    },
    {
      title: 'Get Judged by Experts',
      text: 'Present your work to experienced judges and receive recognition for standout execution and innovation.',
    },
    {
      title: 'Gain Recognition',
      text: 'Compete for visibility, rankings, and achievements that strengthen your profile and confidence.',
    },
    {
      title: 'Build Your Profile',
      text: 'Showcase your technical ability, teamwork, and execution in a high-visibility college event.',
    },
  ];

  const steps = [
    'Register',
    'Create Team',
    'Choose Problem Statement',
    'Build Project',
    'Submit Solution',
    'Get Evaluated',
    'See Leaderboard',
  ];

  const techTitansImpact = [
    {
      title: 'Planning the Event',
      text: 'Defining the structure, format, branding, and participant experience behind HackSphere.',
    },
    {
      title: 'Coordinating Participants',
      text: 'Handling registrations, communication, support, and event flow throughout the hackathon.',
    },
    {
      title: 'Managing Judges',
      text: 'Organizing experts, evaluation flow, scoring, and review coordination professionally.',
    },
    {
      title: 'Designing Problem Statements',
      text: 'Curating meaningful, relevant, and innovation-driven hackathon challenges.',
    },
    {
      title: 'Handling Submissions',
      text: 'Monitoring uploads, tracking deadlines, and ensuring transparent submission workflows.',
    },
    {
      title: 'Publishing Results',
      text: 'Delivering clear rankings, announcements, and final outcome visibility for all participants.',
    },
  ];

  const highlights = [
    '48-hour hackathon experience',
    'Exciting problem challenges',
    'Expert judging panel',
    'Team-based innovation',
    'Leaderboard and results',
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#F6F7FB] text-[#3B3C3E]">
      {/* FIXED / NON-SCROLLABLE BACKGROUND LOGO */}
      <div className="pointer-events-none fixed inset-0 z-[1] flex justify-center">
        <div className="relative mt-24 h-[420px] w-[420px] opacity-[0.16] md:h-[560px] md:w-[560px] lg:h-[760px] lg:w-[760px]">
          <Image
            src={dpgulogo}
            alt="DPGU background watermark"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* soft overlay over watermark */}
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(246,247,251,0.76),rgba(246,247,251,0.58),rgba(246,247,251,0.78))]" />

     <PublicHeader />

      {/* HERO - COMPLETELY REDESIGNED */}
      <section id="home" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#A01C33]/15 bg-white/90 px-4 py-2 text-sm font-semibold text-[#A01C33] shadow-sm backdrop-blur">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                  <Image
                    src={ttlogo}
                    alt="Tech Titans logo"
                    width={30}
                    height={30}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span>Organized by Tech Titans Technical Club of DPGU</span>
              </div>

              <div className="max-w-5xl">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#A01C33]">
                  College Hackathon Platform 2026
                </p>
                <h1 className="text-5xl font-black leading-[1.02] tracking-tight text-[#1F2937] md:text-6xl xl:text-7xl">
                  HackSphere
                  <span className="mt-3 block text-[#A01C33]">
                    Built for innovation.
                  </span>
                  <span className="mt-2 block text-[#2D2E31]">
                    Driven by Tech Titans.
                  </span>
                </h1>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-[#5B6068]">
                HackSphere is a premium 48-hour college hackathon platform created and organized by{' '}
                <span className="font-semibold text-[#A01C33]">
                  Tech Titans Technical Club of DPGU
                </span>{' '}
                to bring students, developers, and innovators together for serious building,
                collaboration, and recognition.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#A01C33]/25 transition hover:-translate-y-0.5">
                  Register Now
                </button>
                <button className="rounded-full border border-[#D1D5DB] bg-white px-6 py-3.5 text-sm font-semibold text-[#3B3C3E] shadow-sm transition hover:border-[#A01C33] hover:text-[#A01C33]">
                  Problem Statements
                </button>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[24px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                  >
                    <div className="text-3xl font-black text-[#A01C33]">{stat.value}</div>
                    <div className="mt-1 text-sm font-medium text-[#6B7280]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5">
              <div className="rounded-[34px] border border-white/80 bg-white/92 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#F8E9ED] ring-1 ring-[#A01C33]/10">
                      <Image
                        src={ttlogo}
                        alt="Tech Titans logo"
                        width={56}
                        height={56}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A01C33]">
                        Lead Organizer
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-[#202225]">
                        Tech Titans Technical Club of DPGU
                      </h3>
                    </div>
                  </div>

                  <div className="hidden rounded-2xl bg-[#F9FAFB] px-3 py-2 ring-1 ring-[#EEF2F7] md:block">
                    <Image
                      src={dpgulogo}
                      alt="DPGU School of Management & Research logo"
                      width={44}
                      height={44}
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] bg-[#202225] p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Hackathon Identity
                  </p>
                  <h4 className="mt-2 text-2xl font-bold">Command Center</h4>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    A polished event experience designed, coordinated, and executed by a club
                    that leads from the front.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                        Platform
                      </p>
                      <p className="mt-1 text-base font-bold">HackSphere</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/60">
                        Organizer
                      </p>
                      <p className="mt-1 text-base font-bold">Tech Titans</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {['Registration', 'Evaluation', 'Leaderboard'].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[#EEF2F7] bg-[#FCFCFD] p-4"
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
                        Module
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#202225]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A01C33]">
                    Why Tech Titans matters
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[#5B6068]">
                    From planning and coordination to execution and innovation, Tech Titans
                    leads the complete hackathon journey and serves as the backbone of the event.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#A01C33]">
                    Institutional identity
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#F9FAFB] ring-1 ring-[#EEF2F7]">
                      <Image
                        src={dpgulogo}
                        alt="DPGU logo"
                        width={42}
                        height={42}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#202225]">DPGU Ecosystem</p>
                      <p className="text-sm text-[#6B7280]">
                        Officially backed visual identity and campus prestige.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BIG FEATURE STRIP */}
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
                    First impression
                  </p>
                  <h3 className="mt-3 text-3xl font-black tracking-tight text-[#202225]">
                    Tech Titans is not a side mention.
                  </h3>
                  <p className="mt-4 text-base leading-8 text-[#5B6068]">
                    The very first screen makes one thing clear: HackSphere is the platform,
                    but Tech Titans Technical Club of DPGU is the organizer, leader, and
                    driving force behind it.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Club-led execution',
                    'Technical leadership',
                    'Premium event flow',
                    'Visible institutional identity',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[#EEF2F7] bg-[#FCFCFD] p-4"
                    >
                      <p className="text-sm font-bold text-[#202225]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-[#A01C33] to-[#7E1428] p-6 text-white shadow-[0_24px_60px_rgba(160,28,51,0.25)]">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">
                Built with ownership
              </p>
              <h3 className="mt-3 text-2xl font-black">Hackathon prestige with club identity</h3>
              <p className="mt-4 text-sm leading-7 text-white/80">
                The page is intentionally designed so visitors immediately understand that
                Tech Titans Technical Club of DPGU leads the event with innovation,
                execution, and campus-level impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="techtitans" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
            About Tech Titans Technical Club of DPGU
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
            The force behind HackSphere
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#5B6068]">
            Tech Titans is the organizing technical club that brings structure, innovation,
            leadership, and execution excellence into the HackSphere experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {techTitansValues.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-lg font-black text-[#A01C33]">
                {item.title.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-[#202225]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about-hackathon" className="relative z-10 bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
              About HackSphere
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
              A 48-hour hackathon platform for participants, judges, and organizers
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5B6068]">
              HackSphere is designed as a complete event platform where teams can register,
              build, submit, get evaluated, follow announcements, and track results from a
              single polished system.
            </p>
          </div>

          <div className="rounded-[32px] border border-[#EEF2F7] bg-[#F9FAFB] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="grid gap-3 sm:grid-cols-2">
              {hacksphereFeatures.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl bg-white px-4 py-4 text-sm font-medium text-[#3B3C3E] shadow-sm ring-1 ring-[#EEF2F7]"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
            Why Join
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
            Why join HackSphere
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {joinBenefits.map((item, index) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-base font-black text-[#A01C33]">
                {index + 1}
              </div>
              <h3 className="text-xl font-bold text-[#202225]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
              Journey
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
              How it works
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFD] p-6 shadow-sm"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33] text-lg font-black text-white">
                  {index + 1}
                </div>
                <h3 className="text-lg font-bold text-[#202225]">{step}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
            Tech Titans Impact
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
            Built with dedication by Tech Titans
          </h2>
          <p className="mt-4 text-lg leading-8 text-[#5B6068]">
            HackSphere reflects the hard work, responsibility, and execution strength
            of the organizing club at every stage of the event.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {techTitansImpact.map((item, index) => (
            <div
              key={item.title}
              className="rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.06)]"
            >
              <div className="mb-4 inline-flex rounded-full bg-[#F8E9ED] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#A01C33]">
                Phase {index + 1}
              </div>
              <h3 className="text-xl font-bold text-[#202225]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
              Event Highlights
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
              A competitive experience designed to feel exciting and elite
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFD] p-6 shadow-sm"
              >
                <div className="mb-4 h-12 w-12 rounded-2xl bg-[#F8E9ED]" />
                <p className="text-base font-bold leading-7 text-[#202225]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-[#202225] px-8 py-12 text-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] lg:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F2B7C2]">
            Ready to Join?
          </p>
          <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-5xl">
            Join HackSphere. Experience the innovation led by Tech Titans Technical Club of DPGU.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
            Become part of a hackathon experience where student innovation meets
            strong leadership, premium execution, and a platform built for serious creators.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#A01C33]/25">
              Register
            </button>
            <button className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[#F8E9ED] ring-1 ring-[#A01C33]/10">
                <Image
                  src={ttlogo}
                  alt="Tech Titans logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-2xl font-black tracking-tight text-[#A01C33]">
                HackSphere
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-7 text-[#6B7280]">
              A premium college hackathon platform proudly organized by Tech Titans
              Technical Club of DPGU — built to celebrate innovation, execution,
              and student leadership.
            </p>
            <p className="mt-4 text-sm font-semibold text-[#202225]">
              Organized by Tech Titans Technical Club of DPGU
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
              Quick Links
            </h4>
            <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
              <p>Home</p>
              <p>About Hackathon</p>
              <p>TechTitans</p>
              <p>Register</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.18em] text-[#A01C33]">
              Connect
            </h4>
            <div className="mt-4 space-y-3 text-sm text-[#6B7280]">
              <p>Email Placeholder</p>
              <p>Instagram Placeholder</p>
              <p>LinkedIn Placeholder</p>
              <p>College Campus Placeholder</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}