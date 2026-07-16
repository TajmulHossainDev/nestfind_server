"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.getReviewsForListing = getReviewsForListing;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const params_1 = require("../utils/params");
const REVIEWS = "reviews";
const LISTINGS = "listings";
async function createReview(req, res) {
    try {
        const body = req.body;
        if (!body.listingId || !mongodb_1.ObjectId.isValid(body.listingId)) {
            return res.status(400).json({ message: "Valid listingId is required." });
        }
        if (!body.rating || body.rating < 1 || body.rating > 5) {
            return res
                .status(400)
                .json({ message: "Rating must be between 1 and 5." });
        }
        if (!body.comment?.trim()) {
            return res.status(400).json({ message: "Comment is required." });
        }
        const db = await (0, db_1.connectDB)();
        const listing = await db
            .collection(LISTINGS)
            .findOne({ _id: new mongodb_1.ObjectId(body.listingId) });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }
        const newReview = {
            listingId: body.listingId,
            userId: req.user.id,
            userName: req.user.name,
            rating: body.rating,
            comment: body.comment.trim(),
            createdAt: new Date(),
        };
        const result = await db.collection(REVIEWS).insertOne(newReview);
        const allReviews = await db
            .collection(REVIEWS)
            .find({ listingId: body.listingId })
            .toArray();
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await db.collection(LISTINGS).updateOne({ _id: new mongodb_1.ObjectId(body.listingId) }, {
            $set: {
                rating: Math.round(avgRating * 10) / 10,
                reviewCount: allReviews.length,
            },
        });
        return res.status(201).json({ _id: result.insertedId, ...newReview });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create review." });
    }
}
async function getReviewsForListing(req, res) {
    try {
        const listingId = (0, params_1.getParam)(req, "listingId");
        if (!listingId || !mongodb_1.ObjectId.isValid(listingId)) {
            return res.status(400).json({ message: "Invalid listing id." });
        }
        const db = await (0, db_1.connectDB)();
        const items = await db
            .collection(REVIEWS)
            .find({ listingId })
            .sort({ createdAt: -1 })
            .toArray();
        return res.json({ items });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch reviews." });
    }
}
