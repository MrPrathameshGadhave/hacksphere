"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  ClipboardCheck,
  FileCode2,
  FileVideo,
  Github,
  Globe,
  Image as ImageIcon,
  Lightbulb,
  MessageSquareText,
  Presentation,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

type ScoreKey =
  | "innovation"
  | "technicalComplexity"
  | "uiUx"
  | "impact"
  | "presentation";

type ScoreState = Record<ScoreKey, number>;

const mockProject = {
  id: "code-titans",
  teamName: "Code Titans",
  projectTitle: "Smart Education Engagement Platform",
  description:
    "A modern education platform designed to improve classroom engagement, attendance visibility, progress insights, and personalized support for students. The team focuses on solving engagement gaps by combining a dashboard, attendance intelligence, and actionable analytics.",
  selectedProblem:
    "Build a platform that improves student engagement, attendance tracking, and personalized learning support.",
  category: "Education",
  difficulty: "Medium",
  members: [
    {
      name: "Prathamesh Gadhave",
      role: "Team Leader",
      initials: "PG",
    },
    {
      name: "Aditi Patil",
      role: "Frontend Developer",
      initials: "AP",
    },
    {
      name: "Rohit Jadhav",
      role: "Backend Developer",
      initials: "RJ",
    },
    {
      name: "Sneha More",
      role: "UI/UX Designer",
      initials: "SM",
    },
  ],
  techStack: [
    "Next.js",
    "Node.js",
    "MongoDB",
    "Tailwind CSS",
    "Chart.js",
    "Cloudinary",
  ],
  githubLink: "https://github.com/example/code-titans-project",
  demoLink: "https://demo.example.com",
  pptLink: "https://drive.google.com/example-ppt",
  videoLink: "https://youtube.com/example-video",
  screenshots: [
    "Dashboard Preview",
    "Attendance Analytics Screen",
    "Student Engagement Overview",
  ],
};

const scoreMeta: {
  key: ScoreKey;
  label: string;
  helper: string;
}[] = [
  {
    key: "innovation",
    label: "Innovation",
    helper: "Originality of the solution and uniqueness of approach.",
  },
  {
    key: "technicalComplexity",
    label: "Technical Complexity",
    helper: "Depth of implementation, architecture, and engineering effort.",
  },
  {
    key: "uiUx",
    label: "UI/UX",
    helper: "Clarity, usability, accessibility, and visual quality.",
  },
  {
    key: "impact",
    label: "Impact",
    helper: "Practical usefulness, relevance, and problem-solving value.",
  },
  {
    key: "presentation",
    label: "Presentation",
    helper: "How clearly the solution is communicated and demonstrated.",
  },
];

export default function JudgeReviewDetailsPage() {
  const [scores, setScores] = useState<ScoreState>({
    innovation: 0,
    technicalComplexity: 0,
    uiUx: 0,
    impact: 0,
    presentation: 0,
  });

  const [feedback, setFeedback] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"draft" | "submitted">(
    "draft"
  );

  const totalScore = useMemo(
    () =>
      scores.innovation +
      scores.technicalComplexity +
      scores.uiUx +
      scores.impact +
      scores.presentation,
    [scores]
  );

  const completedCriteria = useMemo(
    () => Object.values(scores).filter((value) => value > 0).length,
    [scores]
  );

  const setScore = (key: ScoreKey, value: number) => {
    setScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveDraft = () => {
    setReviewStatus("draft");
    alert("Review draft saved locally for now. Backend connection will be added next.");
  };

  const handleSubmitReview = () => {
    const allScored = Object.values(scores).every((value) => value > 0);

    if (!allScored) {
      alert("Please score all criteria before submitting the review.");
      return;
    }

    if (feedback.trim().length < 20) {
      alert("Please add meaningful feedback before submitting the review.");
      return;
    }

    setReviewStatus("submitted");
    alert("Review submitted successfully. Backend API integration will be connected next.");
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.28)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <Link
              href="/judge/reviews"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/95 backdrop-blur-sm transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Review Queue
            </Link>

            <div className="mt-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Detailed Project Evaluation
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Review project, score criteria, and submit final judgment.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Carefully inspect the project details, resources, and presentation
              materials before finalizing your evaluation. Each criterion is
              scored out of 10.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Review Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white capitalize">
                {reviewStatus}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Save draft first, then submit final review.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Total Score</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{totalScore} / 50</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {completedCriteria} of 5 criteria scored.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Project Overview</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  {mockProject.projectTitle}
                </h2>
                <p className="mt-2 text-sm font-medium text-[#A01C33]">
                  Team: {mockProject.teamName}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f8f8f9] px-4 py-2 text-sm font-semibold text-gray-600">
                {mockProject.category} • {mockProject.difficulty}
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-500">
              {mockProject.description}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Selected Problem</p>
                    <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                      {mockProject.selectedProblem}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tech Stack</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {mockProject.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Team Members</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Team composition
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {mockProject.members.map((member) => (
                <div
                  key={member.name}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33] text-sm font-bold text-white">
                      {member.initials}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#3B3C3E]">
                        {member.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Project Resources</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Links and supporting material
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <a
                href={mockProject.githubLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">GitHub Repository</h3>
                    <p className="mt-1 text-sm text-gray-500">Open source code link</p>
                  </div>
                </div>
              </a>

              <a
                href={mockProject.demoLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Live Demo</h3>
                    <p className="mt-1 text-sm text-gray-500">Working demo or hosted app</p>
                  </div>
                </div>
              </a>

              <a
                href={mockProject.pptLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Presentation className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Presentation Deck</h3>
                    <p className="mt-1 text-sm text-gray-500">Project PPT submission</p>
                  </div>
                </div>
              </a>

              <a
                href={mockProject.videoLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5 transition hover:border-[#A01C33]/25 hover:bg-white"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <FileVideo className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Video Walkthrough</h3>
                    <p className="mt-1 text-sm text-gray-500">Demo presentation video</p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Screenshots</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Attached visual previews
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {mockProject.screenshots.map((shot) => (
                <div
                  key={shot}
                  className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#3B3C3E]">{shot}</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Visual resource placeholder for connected uploads.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Evaluation Form</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Score this project
            </h2>

            <div className="mt-6 space-y-5">
              {scoreMeta.map((criterion) => (
                <div
                  key={criterion.key}
                  className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#3B3C3E]">{criterion.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        {criterion.helper}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#A01C33]/10 px-3 py-2 text-sm font-bold text-[#A01C33]">
                      {scores[criterion.key]} / 10
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((num) => {
                      const active = scores[criterion.key] === num;

                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setScore(criterion.key, num)}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition ${
                            active
                              ? "bg-[#A01C33] text-white shadow-[0_10px_20px_rgba(160,28,51,0.18)]"
                              : "border border-gray-200 bg-white text-[#3B3C3E] hover:border-[#A01C33] hover:text-[#A01C33]"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Feedback</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Judge comments
            </h2>

            <div className="mt-6">
              <label
                htmlFor="feedback"
                className="mb-2 block text-sm font-semibold text-[#374151]"
              >
                Constructive Feedback
              </label>
              <div className="relative">
                <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <textarea
                  id="feedback"
                  rows={7}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write detailed, constructive feedback for the team..."
                  className="w-full rounded-2xl border border-gray-300 bg-white pl-12 pr-4 pt-3 pb-3 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Review Summary</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Final evaluation snapshot
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Score</p>
                    <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                      {totalScore} / 50
                    </h3>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Criteria Completed</p>
                    <h3 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                      {completedCriteria} / 5
                    </h3>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Important note</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Reviews should be fair, consistent, and aligned with the same
                  judging standard used for all assigned submissions.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>

              <button
                onClick={handleSubmitReview}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
              >
                <Send className="h-4 w-4" />
                Submit Review
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Judge Reminders</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Evaluation guidelines
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Review all provided material",
                  description:
                    "Check code, demo, presentation, and screenshots before scoring.",
                  icon: FileCode2,
                },
                {
                  title: "Stay aligned with the official criteria",
                  description:
                    "Score only using the approved HackSphere judging dimensions.",
                  icon: BookOpenText,
                },
                {
                  title: "Submit one final review per project",
                  description:
                    "Each assigned project should be evaluated once per judge.",
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#3B3C3E]">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}