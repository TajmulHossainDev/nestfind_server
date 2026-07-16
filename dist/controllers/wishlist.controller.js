"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyWishlistIds = getMyWishlistIds;
exports.getMyWishlistFull = getMyWishlistFull;
exports.toggleWishlist = toggleWishlist;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const WISHLIST = "wishlist";
const LISTINGS = "listings";
async function getMyWishlistIds(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const items = await db
            .collection(WISHLIST)
            .find({ userId: req.user.id })
            .toArray();
        return res.json({ listingIds: items.map((w) => w.listingId) });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch wishlist." });
    }
}
async function getMyWishlistFull(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const wishlistItems = await db
            .collection(WISHLIST)
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .toArray();
        const listingIds = wishlistItems.map((w) => new mongodb_1.ObjectId(w.listingId));
        const listings = await db
            .collection(LISTINGS)
            .find({ _id: { $in: listingIds } })
            .toArray();
        return res.json({ items: listings });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch wishlist." });
    }
}
async function toggleWishlist(req, res) {
    try {
        const { listingId } = req.body;
        if (!listingId || !mongodb_1.ObjectId.isValid(listingId)) {
            return res.status(400).json({ message: "Valid listingId is required." });
        }
        const db = await (0, db_1.connectDB)();
        const userId = req.user.id;
        const existing = await db
            .collection(WISHLIST)
            .findOne({ userId, listingId });
        if (existing) {
            await db.collection(WISHLIST).deleteOne({ _id: existing._id });
            return res.json({ status: "removed" });
        }
        await db.collection(WISHLIST).insertOne({
            userId,
            listingId,
            createdAt: new Date(),
        });
        return res.json({ status: "added" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to update wishlist." });
    }
}
