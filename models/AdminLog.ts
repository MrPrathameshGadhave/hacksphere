import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IAdminLog extends Document {
  action: string;
  admin: Types.ObjectId;
  targetType: string;
  targetId?: Types.ObjectId | null;
  targetLabel?: string;
  details: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    targetLabel: {
      type: String,
      trim: true,
      default: "",
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AdminLogSchema.index({ createdAt: -1 });
AdminLogSchema.index({ action: 1, createdAt: -1 });
AdminLogSchema.index({ targetType: 1, createdAt: -1 });
AdminLogSchema.index({ admin: 1, createdAt: -1 });

const AdminLog: Model<IAdminLog> =
  mongoose.models.AdminLog || mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);

export default AdminLog;
