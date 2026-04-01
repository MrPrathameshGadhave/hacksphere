import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "participant" | "judge" | "admin";
  college?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  isApproved: boolean;
  judgeStatus?: "active" | "pending" | "blocked";
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["participant", "judge", "admin"],
      required: true,
    },
    college: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    judgeStatus: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "pending",
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
