import { model, models, Schema, type Model, type Document } from "mongoose";

export interface ISignupVerification extends Document {
  email: string;
  purpose: "participant_signup";
  codeHash: string;
  verifiedTokenHash?: string;
  attemptCount: number;
  lastSentAt: Date;
  expiresAt: Date;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SignupVerificationSchema = new Schema<ISignupVerification>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ["participant_signup"],
      required: true,
    },
    codeHash: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedTokenHash: {
      type: String,
      default: "",
      trim: true,
    },
    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

SignupVerificationSchema.index({ email: 1, purpose: 1 }, { unique: true });
SignupVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SignupVerification: Model<ISignupVerification> =
  (models.SignupVerification as Model<ISignupVerification>) ||
  model<ISignupVerification>("SignupVerification", SignupVerificationSchema);

export default SignupVerification;
