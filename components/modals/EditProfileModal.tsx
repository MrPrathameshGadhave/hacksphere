"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

type EditProfileForm = {
  name: string;
  email: string;
  organization: string;
  phone: string;
  bio: string;
};

type EditProfileModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  organizationLabel?: string;
  initialValues: EditProfileForm;
};

export default function EditProfileModal({
  open,
  onClose,
  title = "Edit Profile",
  organizationLabel = "Organization",
  initialValues,
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

  const handleSave = () => {
    onClose();
    alert("Profile UI saved locally for now. Backend update will be connected later.");
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
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#374151]">
                Email Address
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
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
                className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
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
                className="h-[52px] w-full rounded-2xl border border-gray-300 px-4 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
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
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#A01C33] focus:ring-4 focus:ring-[#A01C33]/10"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-5">
          <button
            onClick={onClose}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}