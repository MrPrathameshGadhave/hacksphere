import mongoose, { Document, Model, Schema } from "mongoose";

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";
export type ProblemStatus = "Draft" | "Published" | "Archived";

export interface IProblemStatement extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  difficulty: ProblemDifficulty;
  suggestedTechnologies: string[];
  submissionRequirements: string[];
  status: ProblemStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProblemStatementSchema = new Schema<IProblemStatement>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, "Full description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required"],
    },
    suggestedTechnologies: {
      type: [String],
      default: [],
    },
    submissionRequirements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


const ProblemStatement: Model<IProblemStatement> =
  mongoose.models.ProblemStatement ||
  mongoose.model<IProblemStatement>("ProblemStatement", ProblemStatementSchema);

export default ProblemStatement;