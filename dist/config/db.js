"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.getClient = getClient;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
if (!uri)
    throw new Error("MONGODB_URI is not defined in .env");
if (!dbName)
    throw new Error("DB_NAME is not defined in .env");
const client = new mongodb_1.MongoClient(uri);
let db;
async function connectDB() {
    if (db)
        return db;
    console.log("Connecting with MongoDB...");
    await client.connect();
    db = client.db(dbName);
    console.log("Using database:", db.databaseName);
    console.log("MongoDB connected");
    return db;
}
function getClient() {
    return client;
}
