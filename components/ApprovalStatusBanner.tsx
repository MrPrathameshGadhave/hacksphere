"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type ApprovalStatus = {
  status: "approved" | "pending";
  approvedAt?: string;
};

export function ApprovalStatusBanner() {
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (data.user?.isApproved) {
          setApprovalStatus({
            status: "approved",
            approvedAt: new Date().toLocaleDateString(),
          });
        } else {
          setApprovalStatus({ status: "pending" });
        }
      } catch (err) {
        console.error("Failed to fetch approval status:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading || !approvalStatus) return null;

  if (approvalStatus.status === "approved") {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-900">
            Your account is approved!
          </p>
          <p className="text-sm text-green-700">
            You can now access all features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <div>
        <p className="font-semibold text-amber-900">Approval Pending</p>
        <p className="text-sm text-amber-700">
          Your account is under review. This typically takes 24 hours. You'll
          be notified once approved.
        </p>
      </div>
    </div>
  );
}
