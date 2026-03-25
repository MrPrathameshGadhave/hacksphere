"use client";

import { useEffect, useState } from "react";
import { Mail, X } from "lucide-react";

type InviteMemberModalProps = {
  open: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
  loading?: boolean;
};

export default function InviteMemberModal({
  open,
  onClose,
  onSend,
  loading = false,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setEmail("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = email.trim().toLowerCase();

    if (!value) {
      setError("Email is required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    await onSend(value);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-xl rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-[#A01C33]">Invite Member</p>
            <h2 className="mt-1 text-2xl font-bold text-[#3B3C3E]">
              Send secure team invitation
            </h2>
          </div>

          <button
            onClick={onClose}
            type="button"
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <label className="mb-2 block text-sm font-semibold text-[#3B3C3E]">
            Member Email
          </label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter teammate email"
              className="h-12 w-full rounded-2xl border border-gray-200 bg-[#f8f8f9] pl-11 pr-4 text-sm text-[#3B3C3E] outline-none transition focus:border-[#A01C33] focus:bg-white focus:ring-4 focus:ring-[#A01C33]/10"
            />
          </div>

          <p className="mt-3 text-sm leading-7 text-gray-500">
            A secure invitation email will be sent to this address. If the teammate
            is not registered yet, they can create an account first and then accept
            the invitation using the same email.
          </p>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-[#A01C33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#89172c] disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}