import mongoose, { Schema, model, models } from "mongoose";

const TeamInviteSchema = new Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

TeamInviteSchema.index({ invitedEmail: 1, status: 1 });
TeamInviteSchema.index({ team: 1, status: 1 });
TeamInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TeamInvite =
  models.TeamInvite || model("TeamInvite", TeamInviteSchema);

export default TeamInvite;