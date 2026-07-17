import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { getClient } from "../config/db.js";

const client = getClient();
const dbName = process.env.DB_NAME!;

export const auth = betterAuth({
  database: mongodbAdapter(client.db(dbName), { client }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
      httpOnly: true,
    },
  },
  plugins: [admin()],
});
