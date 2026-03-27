import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in .env.local");
}

export type TokenUser = {
  userId: string;
  email: string;
  role: "participant" | "judge" | "admin";
};

export function signToken(payload: TokenUser, expiresIn: string = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as SignOptions);
}

export function verifyToken(token: string): TokenUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenUser;
  } catch {
    return null;
  }
}

export function getTokenFromHeader(authHeader?: string | null) {
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) return null;

  return token;
}