"use client";

import { useState } from "react";
import { Edit3, Mail, Phone, UserCircle2, Users } from "lucide-react";
import EditProfileModal from "@/components/modals/EditProfileModal";
import ProfileInfoCard from "@/components/cards/ProfileInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";

export default function ParticipantProfilePage() {
  const [openEdit, setOpenEdit] = useState(false);

  const initialValues = {
    name: "Prathamesh Gadhave",
    email: "prathamesh@example.com",
    organization: "DYP University",
    phone: "+91 9876543210",
    bio: "Participant in HackSphere, interested in full-stack development, UI building, and hackathon product design.",
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[30px] bg-gradient-to-r from-[#A01C33] via-[#93192f] to-[#7d1427] p-8 text-white shadow-[0_20px_60px_rgba(160,28,51,0.24)] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
              Participant Profile
            </div>

            <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
              Manage your profile and participation details.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
              View your account information, team-related identity, and participant
              access details from one central profile page.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-[#A01C33]">
              PG
            </div>
            <div>
              <h2 className="text-2xl font-bold">Prathamesh</h2>
              <p className="mt-1 text-white/80">Participant • HackSphere</p>
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
            subtitle="Your visible account and participant details."
            fields={[
              { label: "Full Name", value: "Prathamesh Gadhave" },
              { label: "Email", value: "prathamesh@example.com" },
              { label: "College", value: "DYP University" },
              { label: "Phone", value: "+91 9876543210" },
              { label: "Joined", value: "17 Mar 2026" },
              { label: "Team Status", value: "Team Member / Leader Pending" },
            ]}
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">About</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Additional profile description for participant identity.
            </p>

            <div className="mt-6 rounded-[22px] border border-gray-200 bg-[#fcfcfd] p-5">
              <p className="text-sm leading-7 text-gray-600">
                Participant in HackSphere, interested in full-stack development,
                UI building, and hackathon product design.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SecurityCard
            roleLabel="Participant"
            accessText="Access is limited to dashboard, team management, problem statements, submission, announcements, leaderboard, and profile features."
          />

          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
            <h2 className="text-2xl font-bold text-[#3B3C3E]">Quick Info</h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Contact Email",
                  value: "prathamesh@example.com",
                  icon: Mail,
                },
                {
                  title: "Phone Number",
                  value: "+91 9876543210",
                  icon: Phone,
                },
                {
                  title: "Role",
                  value: "Participant",
                  icon: UserCircle2,
                },
                {
                  title: "Team Access",
                  value: "Enabled",
                  icon: Users,
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
        title="Edit Participant Profile"
        organizationLabel="College"
        initialValues={initialValues}
      />
    </section>
  );
}