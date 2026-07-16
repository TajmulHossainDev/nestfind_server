import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) throw new Error("MONGODB_URI is not defined in .env");
if (!dbName) throw new Error("DB_NAME is not defined in .env");

const client = new MongoClient(uri);
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;

  console.log("Connecting with MongoDB...");
  await client.connect();

  db = client.db(dbName);

  console.log("Using database:", db.databaseName);
  console.log("MongoDB connected");

  return db;
}

export function getClient() {
  return client;
}
