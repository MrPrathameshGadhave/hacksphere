import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITeam extends Document {
  teamName: string;
  teamDescription?: string;
  leader: Types.ObjectId;
  members: Types.ObjectId[];
  maxSize: number;
  problemStatement?: Types.ObjectId | null;
  status: "active" | "pending" | "disqualified";
  inviteCode?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    teamDescription: {
      type: String,
      trim: true,
      default: "",
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxSize: {
      type: Number,
      default: 4,
      min: 1,
    },
    problemStatement: {
      type: Schema.Types.ObjectId,
      ref: "ProblemStatement",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "pending", "disqualified"],
      default: "active",
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;