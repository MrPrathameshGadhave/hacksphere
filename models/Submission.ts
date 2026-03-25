import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISubmission extends Document {
  team: Types.ObjectId;
  projectTitle: string;
  description?: string;
  githubLink?: string;
  demoLink?: string;
  pptLink?: string;
  videoLink?: string;
  images: string[];
  techStack: string[];
  status: "draft" | "submitted" | "locked";
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true,
    },
    projectTitle: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    githubLink: {
      type: String,
      trim: true,
      default: "",
    },
    demoLink: {
      type: String,
      trim: true,
      default: "",
    },
    pptLink: {
      type: String,
      trim: true,
      default: "",
    },
    videoLink: {
      type: String,
      trim: true,
      default: "",
    },
    images: {
      type: [String],
      default: [],
    },
    techStack: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "locked"],
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

const Submission: Model<ISubmission> =
  mongoose.models.Submission ||
  mongoose.model<ISubmission>("Submission", SubmissionSchema);

export default Submission;