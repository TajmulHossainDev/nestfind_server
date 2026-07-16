"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const mongodb_1 = require("better-auth/adapters/mongodb");
const plugins_1 = require("better-auth/plugins");
const db_1 = require("../config/db");
const client = (0, db_1.getClient)();
const dbName = process.env.DB_NAME;
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, mongodb_1.mongodbAdapter)(client.db(dbName), { client }),
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
    plugins: [(0, plugins_1.admin)()],
});
