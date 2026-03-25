import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IJudgeAssignment extends Document {
  judge: Types.ObjectId;
  submission: Types.ObjectId;
  assignedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const JudgeAssignmentSchema = new Schema<IJudgeAssignment>(
  {
    judge: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

JudgeAssignmentSchema.index({ judge: 1, submission: 1 }, { unique: true });

const JudgeAssignment: Model<IJudgeAssignment> =
  mongoose.models.JudgeAssignment ||
  mongoose.model<IJudgeAssignment>("JudgeAssignment", JudgeAssignmentSchema);

export default JudgeAssignment;