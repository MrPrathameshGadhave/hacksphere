"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCode2,
  FileVideo,
  FolderKanban,
  Github,
  Globe,
  ImagePlus,
  Lightbulb,
  Link2,
  Presentation,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

type SubmissionForm = {
  projectTitle: string;
  description: string;
  githubLink: string;
  demoLink: string;
  pptLink: string;
  videoLink: string;
  techStack: string;
};

export default function ParticipantSubmissionPage() {
  const [formData, setFormData] = useState<SubmissionForm>({
    projectTitle: "",
    description: "",
    githubLink: "",
    demoLink: "",
    pptLink: "",
    videoLink: "",
    techStack: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const checklist = useMemo(
    () => [
      {
        label: "Project title added",
        done: formData.projectTitle.trim().length > 2,
      },
      {
        label: "Project description added",
        done: formData.description.trim().length > 20,
      },
      {
        label: "GitHub repository linked",
        done: formData.githubLink.trim().length > 0,
      },
      {
        label: "Demo link added",
        done: formData.demoLink.trim().length > 0,
      },
      {
        label: "Tech stack mentioned",
        done: formData.techStack.trim().length > 0,
      },
    ],
    [formData]
  );

  const completedCount = checklist.filter((item) => item.done).length;

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Project Submission • Final Delivery Workspace
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Submit your project with clarity, confidence, and complete details.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Add your project title, description, repository, demo links, tech
              stack, and supporting resources so judges can review your work
              properly and fairly.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90">
                Save Draft
                <Save className="h-4 w-4" />
              </button>

              <Link
                href="/participant/problems"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                View Selected Problem
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Submission Status</p>
              <h3 className="mt-2 text-2xl font-bold text-white">Draft</h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Your final project has not been submitted yet.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/80">Completion Progress</p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {completedCount} / {checklist.length}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Complete the key requirements before final submission.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#A01C33]">Project Information</p>
                <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
                  Core submission details
                </h2>
              </div>

              <div className="hidden rounded-2xl bg-[#A01C33]/10 px-4 py-2 text-sm font-semibold text-[#A01C33] sm:block">
                Team Leader Access
              </div>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <label
                  htmlFor="projectTitle"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Project Title
                </label>
                <div className="relative">
                  <FileCode2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="projectTitle"
                    name="projectTitle"
                    type="text"
                    placeholder="Enter your final project title"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Project Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Explain your project idea, problem being solved, core features, technical approach, and expected impact..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="techStack"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Tech Stack
                </label>
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="techStack"
                    name="techStack"
                    type="text"
                    placeholder="Example: Next.js, Node.js, MongoDB, Tailwind CSS"
                    value={formData.techStack}
                    onChange={handleChange}
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Project Links</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Add important resources
            </h2>

            <div className="mt-6 grid gap-5">
              <div>
                <label
                  htmlFor="githubLink"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  GitHub Repository Link
                </label>
                <div className="relative">
                  <Github className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="githubLink"
                    name="githubLink"
                    type="text"
                    placeholder="https://github.com/your-team/project"
                    value={formData.githubLink}
                    onChange={handleChange}
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="demoLink"
                  className="mb-2 block text-sm font-semibold text-[#374151]"
                >
                  Demo / Live Project Link
                </label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="demoLink"
                    name="demoLink"
                    type="text"
                    placeholder="https://your-demo-link.com"
                    value={formData.demoLink}
                    onChange={handleChange}
                    className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="pptLink"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    PPT Link
                  </label>
                  <div className="relative">
                    <Presentation className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="pptLink"
                      name="pptLink"
                      type="text"
                      placeholder="Optional presentation link"
                      value={formData.pptLink}
                      onChange={handleChange}
                      className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="videoLink"
                    className="mb-2 block text-sm font-semibold text-[#374151]"
                  >
                    Video Demo Link
                  </label>
                  <div className="relative">
                    <FileVideo className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                      id="videoLink"
                      name="videoLink"
                      type="text"
                      placeholder="Optional video walkthrough link"
                      value={formData.videoLink}
                      onChange={handleChange}
                      className="h-[54px] w-full rounded-2xl border border-gray-300 bg-white py-3 pl-12 pr-4 text-sm text-[#111827] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Attachments</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Screenshots and supporting media
            </h2>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border-2 border-dashed border-gray-300 bg-[#fafafa] p-6 text-center transition hover:border-[#A01C33]/35 hover:bg-white">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                  Upload project screenshots
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Add UI previews, dashboards, workflow screens, or output
                  images to support your submission.
                </p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#89172c]">
                  <ImagePlus className="h-4 w-4" />
                  Upload Images
                </button>
              </div>

              <div className="rounded-[24px] border border-gray-200 bg-[#fcfcfd] p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Link2 className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#3B3C3E]">
                  Resource link notes
                </h3>
                <p className="mt-2 text-sm leading-7 text-gray-500">
                  Keep all links accessible and public for the judges during the
                  review process.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>• GitHub repo should be accessible</li>
                  <li>• Demo link should be working</li>
                  <li>• PPT and video links should not require permission requests</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]">
              <Save className="h-4 w-4" />
              Save as Draft
            </button>

            <button className="inline-flex items-center gap-2 rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]">
              <Send className="h-4 w-4" />
              Final Submit Project
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Submission Checklist</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Complete before final submit
            </h2>

            <div className="mt-6 space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                    item.done
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-[#fcfcfd]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      item.done
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        item.done ? "text-green-700" : "text-[#3B3C3E]"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Selected Problem</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Challenge reference
            </h2>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Problem Status</p>
                  <h3 className="mt-2 text-lg font-bold text-[#3B3C3E]">
                    Not Selected
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">
                    Choose a problem statement before final submission.
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>

              <Link
                href="/participant/problems"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#A01C33]"
              >
                Go to Problem Statements
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-sm font-medium text-[#A01C33]">Important Guidelines</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Before you submit
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <ClipboardCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Only team leader can submit</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Final submission control is restricted to the team leader.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#A01C33]/10 text-[#A01C33]">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#3B3C3E]">Drafts can be updated</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Save progress first, then finalize before deadline lock.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-dashed border-[#A01C33]/25 bg-[#A01C33]/[0.03] p-5">
                <p className="text-sm font-medium text-[#A01C33]">Recommended next step</p>
                <p className="mt-2 text-sm leading-7 text-[#3B3C3E]">
                  Finalize your team and selected problem, then complete all
                  essential links before the final submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}