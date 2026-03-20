"use client";

import { useState } from "react";
import { Edit3, Mail, Phone, Scale, UserCircle2 } from "lucide-react";
import EditProfileModal from "@/components/modals/EditProfileModal";
import ProfileInfoCard from "@/components/cards/ProfileInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";

export default function JudgeProfilePage() {
  const [openEdit, setOpenEdit] = useState(false);

  const initialValues = {
    name: "Dr. Kiran Patil",
    email: "kiran.patil@example.com",
    organization: "DYP University",
    phone: "+91 9988776655",
    bio: "Judge for HackSphere with expertise in web systems, solution evaluation, and product architecture.",
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Judge Profile
            </div>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              Manage your judging identity and account details.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              Keep your profile updated while reviewing projects, evaluating
              submissions, and contributing to the final rankings.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-[#A01C33]">
              KP
            </div>
            <div>
              <h2 className="text-2xl font-bold">Dr. Kiran Patil</h2>
              <p className="mt-1 text-white/80">Judge • HackSphere</p>
              <button
                onClick={() => setOpenEdit(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[#A01C33] transition hover:bg-white/90"
              >
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <ProfileInfoCard
            title="Basic Information"
            subtitle="Your judging account and official information."
            fields={[
              { label: "Full Name", value: "Dr. Kiran Patil" },
              { label: "Email", value: "kiran.patil@example.com" },
              { label: "Institution", value: "DYP University" },
              { label: "Phone", value: "+91 9988776655" },
              { label: "Expertise", value: "Web Systems" },
              { label: "Joined", value: "16 Mar 2026" },
            ]}
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">About</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Judge profile summary and review background.
            </p>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm leading-7 text-gray-600">
                Judge for HackSphere with expertise in web systems, solution
                evaluation, and product architecture.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SecurityCard
            roleLabel="Judge"
            accessText="Access is limited to judge dashboard, assigned project reviews, leaderboard view, and personal profile."
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">Quick Info</h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Contact Email",
                  value: "kiran.patil@example.com",
                  icon: Mail,
                },
                {
                  title: "Phone Number",
                  value: "+91 9988776655",
                  icon: Phone,
                },
                {
                  title: "Role",
                  value: "Judge",
                  icon: UserCircle2,
                },
                {
                  title: "Review Access",
                  value: "Assigned Projects Only",
                  icon: Scale,
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
                        <p className="mt-2 text-sm text-gray-500">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Edit Judge Profile"
        organizationLabel="Institution"
        initialValues={initialValues}
      />
    </section>
  );
}