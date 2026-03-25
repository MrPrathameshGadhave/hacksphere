"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-[#3B3C3E]">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update account details and profile information.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="space-y-5 px-6 py-6">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  {organizationLabel}
                </label>
                <input
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#374151]">
                  Phone
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                Bio
              </label>
              <textarea
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}