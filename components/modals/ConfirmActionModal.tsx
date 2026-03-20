"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type ConfirmActionModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success";
  loading?: boolean;
};

export default function ConfirmActionModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmActionModalProps) {
  if (!open) return null;

  const styles = {
    danger: {
      iconWrap: "bg-red-100 text-red-600",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
      border: "border-red-200 bg-red-50",
    },
    warning: {
      iconWrap: "bg-amber-100 text-amber-700",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
      border: "border-amber-200 bg-amber-50",
    },
    success: {
      iconWrap: "bg-green-100 text-green-700",
      confirmBtn: "bg-green-600 hover:bg-green-700 text-white",
      border: "border-green-200 bg-green-50",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${styles.iconWrap}`}
            >
              {variant === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertTriangle className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#3B3C3E]">{title}</h2>
              <p className="text-sm text-gray-500">Please review before continuing.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className={`rounded-[22px] border p-5 ${styles.border}`}>
            <p className="text-sm leading-7 text-gray-700">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 px-6 py-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#3B3C3E] transition hover:border-[#A01C33] hover:text-[#A01C33] disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60 ${styles.confirmBtn}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}