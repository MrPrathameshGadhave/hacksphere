import { Types } from "mongoose";
import AdminLog from "@/models/AdminLog";

type AuditDetails = Record<string, unknown>;

export type RecordAdminAuditLogInput = {
  action: string;
  adminId: string;
  targetType: string;
  targetId?: string | null;
  targetLabel?: string;
  details?: AuditDetails;
};

function toObjectId(value?: string | null) {
  if (!value || !Types.ObjectId.isValid(value)) {
    return null;
  }

  return new Types.ObjectId(value);
}

export async function recordAdminAuditLog({
  action,
  adminId,
  targetType,
  targetId,
  targetLabel,
  details = {},
}: RecordAdminAuditLogInput) {
  if (!Types.ObjectId.isValid(adminId)) {
    return;
  }

  try {
    await AdminLog.create({
      action,
      admin: new Types.ObjectId(adminId),
      targetType,
      targetId: toObjectId(targetId),
      targetLabel: targetLabel || "",
      details,
    });
  } catch (error) {
    console.error("Failed to record admin audit log:", error);
  }
}
