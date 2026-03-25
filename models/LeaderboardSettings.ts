import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ILeaderboardSettings extends Document {
  key: string;
  isPublished: boolean;
  publishedAt?: Date | null;
  publishedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeaderboardSettingsSchema = new Schema<ILeaderboardSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LeaderboardSettings: Model<ILeaderboardSettings> =
  mongoose.models.LeaderboardSettings ||
  mongoose.model<ILeaderboardSettings>(
    "LeaderboardSettings",
    LeaderboardSettingsSchema
  );

export default LeaderboardSettings;