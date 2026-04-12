'use client';

import Image from 'next/image';
import ttlogo from './utils/tt.jpeg';
import dpgulogo from './utils/dpgu.jpeg';
import Footer from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/PublicHeader";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FloatingOrbs, ParticleAnimation, HexagonPattern, ComplexShapeAnimation, AnimatedDots } from '@/components/home/AnimatedSVGElements';
import {
  GuestOnly,
  WorkspaceLink,
} from "@/components/public/PublicAuthActions";

// SVG Icons/Illustrations Components
const GearIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LightbulbIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5h.01M9 9h.01" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <>{count}</>;
};

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
    <div className="min-h-screen bg-[#F6F7FB] text-[#3B3C3E]">
            <PublicHeader />
      
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

     

      {/* HERO - COMPLETELY REDESIGNED */}
      <section id="home" className="relative z-10 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <HexagonPattern />
          <FloatingOrbs />
          <ComplexShapeAnimation />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16 pt-14 lg:px-8 lg:pb-24 relative z-10 ">
          <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#A01C33]/15 bg-white/90 px-4 py-2 text-sm font-semibold text-[#A01C33] shadow-sm backdrop-blur animate-fade-in-down">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white ">
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
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-[#A01C33] animate-fade-in-down" style={{ animationDelay: '100ms' }}>
                  College Hackathon Platform 2026
                </p>
                <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-[#1F2937] md:text-5xl xl:text-6xl animate-fade-in-down" style={{ animationDelay: '200ms' }}>
                  HackSphere
                  <span className="mt-3 block text-[#A01C33] bg-gradient-to-r from-[#A01C33] to-[#c92e4d] bg-clip-text text-transparent">
                    Built for innovation.
                  </span>
                  <span className="mt-2 block text-[#2D2E31]">
                    Driven by Tech Titans.
                  </span>
                </h1>
              </div>

              <p className="max-w-2xl text-lg leading-8 text-[#5B6068] animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                HackSphere is a premium 48-hour college hackathon platform created and organized by{' '}
                <span className="font-semibold text-[#A01C33]">
                  Tech Titans Technical Club of DPGU
                </span>{' '}
                to bring students, developers, and innovators together for serious building,
                collaboration, and recognition.
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <GuestOnly>
                  <Link href="/register" className="group rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#A01C33]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#A01C33]/40 active:scale-95">
                    <span className="flex items-center gap-2">
                      Register Now
                      <RocketIcon />
                    </span>
                  </Link>
                </GuestOnly>
                <WorkspaceLink className="group rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#A01C33]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#A01C33]/40 active:scale-95" />
                <Link href="/problem-statements" className="rounded-full border border-[#D1D5DB] bg-white px-6 py-3.5 text-sm font-semibold text-[#3B3C3E] shadow-sm transition-all duration-300 hover:border-[#A01C33] hover:text-[#A01C33] hover:shadow-md hover:-translate-y-0.5">
                  Problem Statements
                </Link>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, i) => (
                  <div
                    key={stat.label}
                    className="group rounded-[24px] border border-white/80 bg-white/92 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-500 transform hover:shadow-[0_25px_50px_rgba(160,28,51,0.15)] hover:scale-105 hover:-translate-y-1 cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="text-3xl font-black text-[#A01C33] transition-transform group-hover:scale-110">
                      {stat.value.includes('+') ? stat.value : <AnimatedCounter end={parseInt(stat.value)} />}
                      {stat.value.includes('+') && '+'}
                    </div>
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
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.15fr_0.85fr] animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="group rounded-[32px] border border-white/80 bg-white/92 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.06)] backdrop-blur transition-all duration-500 hover:shadow-[0_30px_70px_rgba(160,28,51,0.12)] hover:border-[#A01C33]/30">
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
                  ].map((item, idx) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[#EEF2F7] bg-[#FCFCFD] p-4 transition-all duration-300 hover:border-[#A01C33]/20 hover:bg-white hover:shadow-md transform hover:scale-105 cursor-pointer"
                    >
                      <p className="text-sm font-bold text-[#202225]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="group rounded-[32px] bg-gradient-to-br from-[#A01C33] via-[#912637] to-[#7E1428] p-6 text-white shadow-[0_24px_60px_rgba(160,28,51,0.25)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(160,28,51,0.35)] hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <svg className="absolute w-full h-full" viewBox="0 0 2 2" preserveAspectRatio="none">
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <rect width="2" height="2" fill="url(#grad2)" />
                </svg>
              </div>
              <div className="relative z-10">
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
        </div>
      </section>

      <section id="techtitans" className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 max-w-3xl animate-fade-in-up">
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
          {techTitansValues.map((item, i) => (
            <div
              key={item.title}
              className="group rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-all duration-500 transform hover:shadow-[0_30px_60px_rgba(160,28,51,0.15)] hover:-translate-y-2 hover:border-[#A01C33]/30 animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F8E9ED] to-[#FCE4EC] text-lg font-black text-[#A01C33] group-hover:scale-110 transition-transform duration-300">
                {i === 0 && <GearIcon />}
                {i === 1 && <RocketIcon />}
                {i === 2 && <StarIcon />}
                {i === 3 && <LightbulbIcon />}
              </div>
              <h3 className="text-xl font-bold text-[#202225]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="about-hackathon" className="relative z-10 bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div className="animate-fade-in-up">
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

          <div className="rounded-[32px] border border-[#EEF2F7] bg-[#F9FAFB] p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-all duration-500 hover:shadow-[0_30px_70px_rgba(160,28,51,0.08)] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="grid gap-3 sm:grid-cols-2">
              {hacksphereFeatures.map((feature, idx) => (
                <div
                  key={feature}
                  className="rounded-2xl bg-white px-4 py-4 text-sm font-medium text-[#3B3C3E] shadow-sm ring-1 ring-[#EEF2F7] transition-all duration-300 hover:ring-[#A01C33]/20 hover:shadow-md transform hover:scale-105 cursor-pointer"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 max-w-3xl animate-fade-in-up">
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
              className="group rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-all duration-500 transform hover:shadow-[0_30px_60px_rgba(160,28,51,0.15)] hover:-translate-y-2 hover:border-[#A01C33]/30 animate-fade-in-up cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#A01C33]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E9ED] text-base font-black text-[#A01C33] group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-[#202225]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#6B7280]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-12 max-w-3xl animate-fade-in-up">
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
                className="group rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFD] p-6 shadow-sm transition-all duration-500 transform hover:shadow-lg hover:border-[#A01C33]/30 hover:-translate-y-1 animate-fade-in-up relative overflow-hidden"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#A01C33]/5 group-hover:bg-[#A01C33]/10 transition-colors duration-300" />
                <div className="relative z-10">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A01C33] to-[#7E1428] text-lg font-black text-white group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-[#202225]">{step}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-12 max-w-4xl animate-fade-in-up">
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
              className="group rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.06)] transition-all duration-500 transform hover:shadow-[0_30px_70px_rgba(160,28,51,0.12)] hover:-translate-y-2 hover:border-[#A01C33]/30 animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F8E9ED] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#A01C33] group-hover:bg-[#A01C33] group-hover:text-white transition-all duration-300">
                <span className="inline-block w-2 h-2 rounded-full bg-current"></span>
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
          <div className="mb-12 max-w-3xl animate-fade-in-up">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#A01C33]">
              Event Highlights
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#202225]">
              A competitive experience designed to feel exciting and elite
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {highlights.map((item, idx) => (
              <div
                key={item}
                className="group rounded-[24px] border border-[#EEF2F7] bg-[#FCFCFD] p-6 shadow-sm transition-all duration-500 transform hover:shadow-md hover:border-[#A01C33]/30 hover:-translate-y-1 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#F8E9ED] to-[#FCE4EC] group-hover:from-[#A01C33] group-hover:to-[#7E1428] transition-all duration-300 flex items-center justify-center">
                  <StarIcon />
                </div>
                <p className="text-base font-bold leading-7 text-[#202225]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-[#202225] via-[#2a2d33] to-[#1a1b1f] px-8 py-12 text-white shadow-[0_30px_70px_rgba(15,23,42,0.18)] lg:px-12 relative">
          {/* Animated background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <ParticleAnimation />
          </div>

          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#F2B7C2] animate-fade-in-down">
              Ready to Join?
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-tight md:text-5xl animate-fade-in-down" style={{ animationDelay: '100ms' }}>
              Join HackSphere. Experience the innovation led by Tech Titans Technical Club of DPGU.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Become part of a hackathon experience where student innovation meets
              strong leadership, premium execution, and a platform built for serious creators.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <GuestOnly>
                <Link href="/register" className="group rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#A01C33]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#A01C33]/40 active:scale-95 flex items-center gap-2">
                  <RocketIcon />
                  Register
                </Link>
              </GuestOnly>
              <WorkspaceLink className="group rounded-full bg-[#A01C33] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#A01C33]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#A01C33]/40 active:scale-95 flex items-center gap-2" />
              <Link href="/#about-hackathon" className="rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

       <Footer />
    </div>
  );
}
