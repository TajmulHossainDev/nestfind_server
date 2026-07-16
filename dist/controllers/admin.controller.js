"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsersAdmin = getAllUsersAdmin;
exports.deleteUserAdmin = deleteUserAdmin;
exports.getAllListingsAdmin = getAllListingsAdmin;
exports.deleteListingAdmin = deleteListingAdmin;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const params_1 = require("../utils/params");
async function getAllUsersAdmin(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const users = await db
            .collection("user")
            .find({}, { projection: { password: 0 } })
            .sort({ createdAt: -1 })
            .toArray();
        return res.json({ items: users });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch users." });
    }
}
async function deleteUserAdmin(req, res) {
    try {
        const id = (0, params_1.getParam)(req, "id");
        if (!id || !mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user id." });
        }
        const db = await (0, db_1.connectDB)();
        await db.collection("user").deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.json({ message: "User deleted successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete user." });
    }
}
async function getAllListingsAdmin(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const items = await db
            .collection("listings")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        return res.json({ items });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch listings." });
    }
}
async function deleteListingAdmin(req, res) {
    try {
        const id = (0, params_1.getParam)(req, "id");
        if (!id || !mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing id." });
        }
        const db = await (0, db_1.connectDB)();
        await db
            .collection("listings")
            .deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.json({ message: "Listing deleted successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete listing." });
    }
}
