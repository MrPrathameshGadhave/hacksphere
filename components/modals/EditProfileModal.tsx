"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type EditProfileForm = {
  name: string;
  email: string;
  organization: string;
  phone: string;
  bio: string;
};

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  onSave?: (values: EditProfileForm) => void | Promise<void>;
  title?: string;
  organizationLabel?: string;
  initialValues: EditProfileForm;
  saving?: boolean;
  error?: string | null;
};

export default function EditProfileModal({
  open,
  onClose,
  onSave,
  title = "Edit Profile",
  organizationLabel = "Organization",
  initialValues,
  saving = false,
  error = null,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<EditProfileForm>(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (saving) return;

    if (onSave) {
      await onSave({
        name: formData.name.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
      });
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(32,23,29,0.48)] px-4 py-6 backdrop-blur-md">
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-hidden rounded-[32px] border border-[#eadfe3] bg-[linear-gradient(180deg,#fffdfb_0%,#fff8f7_100%)] shadow-[0_30px_90px_rgba(32,23,29,0.24)]">
        <div className="max-h-[calc(100vh-3rem)] overflow-y-auto">
          <div className="border-b border-[#efe4e8] bg-[linear-gradient(135deg,#fff8f7_0%,#fff3f5_100%)] px-6 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full border border-[#ead7de] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6773]">
                  Profile Editor
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#26161d]">
                  {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#705b63]">
                  Update the details that shape your public identity inside the
                  workspace.
                </p>
              </div>

              <button
                onClick={onClose}
                disabled={saving}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfe3] bg-white/90 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="space-y-6 px-6 py-6 sm:px-7">
              {error ? (
                <div className="rounded-[22px] border border-red-200 bg-[linear-gradient(135deg,#fff8f8_0%,#fff0f0_100%)] px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4b3d43]">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-[54px] w-full rounded-2xl border border-[#e3d6db] bg-white/90 px-4 text-sm text-[#2e1f25] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#faf5f6]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4b3d43]">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-[54px] w-full rounded-2xl border border-[#e3d6db] bg-white/90 px-4 text-sm text-[#2e1f25] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#faf5f6]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4b3d43]">
                    {organizationLabel}
                  </label>
                  <input
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-[54px] w-full rounded-2xl border border-[#e3d6db] bg-white/90 px-4 text-sm text-[#2e1f25] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#faf5f6]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#4b3d43]">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-[54px] w-full rounded-2xl border border-[#e3d6db] bg-white/90 px-4 text-sm text-[#2e1f25] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#faf5f6]"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-[#eadfe3] bg-[linear-gradient(135deg,#fffdfb_0%,#fff7f6_100%)] p-5">
                <label className="mb-2 block text-sm font-semibold text-[#4b3d43]">
                  Bio
                </label>
                <p className="mb-4 text-sm leading-6 text-[#705b63]">
                  Share a short introduction, your role in the event, or the
                  context that helps teammates and organizers recognize you.
                </p>
                <textarea
                  name="bio"
                  rows={5}
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-2xl border border-[#e3d6db] bg-white/90 px-4 py-3 text-sm text-[#2e1f25] outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-[#faf5f6]"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[#efe4e8] bg-white/70 px-6 py-5 sm:px-7">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-2xl border border-[#eadfe3] bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(160,28,51,0.18)] transition duration-300 hover:bg-[#8f1a2e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
