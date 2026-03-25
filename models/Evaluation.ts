import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEvaluation extends Document {
  submission: Types.ObjectId;
  judge: Types.ObjectId;
  innovation: number;
  technicalComplexity: number;
  uiUx: number;
  impact: number;
  presentation: number;
  totalScore: number;
  feedback?: string;
  status: "draft" | "submitted";
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EvaluationSchema = new Schema<IEvaluation>(
  {
    submission: {
      type: Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
    },
    judge: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    innovation: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    technicalComplexity: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    uiUx: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    impact: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    presentation: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    feedback: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "submitted"],
      default: "draft",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

EvaluationSchema.index({ submission: 1, judge: 1 }, { unique: true });

const Evaluation: Model<IEvaluation> =
  mongoose.models.Evaluation ||
  mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);

export default Evaluation;