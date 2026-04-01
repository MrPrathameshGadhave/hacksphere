import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI?.trim();
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "hacksphere";
const MONGODB_CONNECT_TIMEOUT_MS = Number(
  process.env.MONGODB_CONNECT_TIMEOUT_MS || 15000
);
const MONGODB_SERVER_SELECTION_TIMEOUT_MS = Number(
  process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 15000
);

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in .env or .env.local");
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export default async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn?.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn?.connection.readyState === 0) {
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      dbName: MONGODB_DB_NAME,
      connectTimeoutMS: MONGODB_CONNECT_TIMEOUT_MS,
      serverSelectionTimeoutMS: MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      family: 4,
      maxPoolSize: 10,
    }).catch((error: unknown) => {
      cached.conn = null;
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    throw error;
  }
}
