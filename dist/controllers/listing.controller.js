"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListing = createListing;
exports.getListings = getListings;
exports.getListingById = getListingById;
exports.getMyListings = getMyListings;
exports.deleteListing = deleteListing;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const params_1 = require("../utils/params");
const COLLECTION = "listings";
async function createListing(req, res) {
    try {
        const body = req.body;
        if (!body.title ||
            !body.shortDescription ||
            !body.fullDescription ||
            !body.location) {
            return res.status(400).json({ message: "Missing required fields." });
        }
        if (typeof body.price !== "number" || body.price <= 0) {
            return res
                .status(400)
                .json({ message: "Price must be a positive number." });
        }
        const db = await (0, db_1.connectDB)();
        const newListing = {
            title: body.title,
            shortDescription: body.shortDescription,
            fullDescription: body.fullDescription,
            images: body.images?.length
                ? body.images
                : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"],
            price: body.price,
            location: body.location,
            category: body.category,
            bedrooms: body.bedrooms,
            bathrooms: body.bathrooms,
            amenities: body.amenities || [],
            rating: 0,
            reviewCount: 0,
            hostId: req.user.id,
            hostName: req.user.name,
            createdAt: new Date(),
        };
        const result = await db
            .collection(COLLECTION)
            .insertOne(newListing);
        return res.status(201).json({ _id: result.insertedId, ...newListing });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create listing." });
    }
}
async function getListings(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const { search, category, maxPrice, sort, page = "1", limit = "8", } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }
        if (category && category !== "all") {
            filter.category = category;
        }
        if (maxPrice) {
            filter.price = { $lte: Number(maxPrice) };
        }
        let sortQuery = {};
        switch (sort) {
            case "price-asc":
                sortQuery = { price: 1 };
                break;
            case "price-desc":
                sortQuery = { price: -1 };
                break;
            case "rating":
                sortQuery = { rating: -1 };
                break;
            case "newest":
                sortQuery = { createdAt: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * limitNum;
        const collection = db.collection(COLLECTION);
        const [items, total] = await Promise.all([
            collection
                .find(filter)
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            collection.countDocuments(filter),
        ]);
        return res.json({
            items,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch listings." });
    }
}
async function getListingById(req, res) {
    try {
        const id = (0, params_1.getParam)(req, "id");
        if (!id || !mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing id." });
        }
        const db = await (0, db_1.connectDB)();
        const listing = await db
            .collection(COLLECTION)
            .findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }
        return res.json(listing);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch listing." });
    }
}
async function getMyListings(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const items = await db
            .collection(COLLECTION)
            .find({ hostId: req.user.id })
            .sort({ createdAt: -1 })
            .toArray();
        return res.json({ items });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch your listings." });
    }
}
async function deleteListing(req, res) {
    try {
        const id = (0, params_1.getParam)(req, "id");
        if (!id || !mongodb_1.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid listing id." });
        }
        const db = await (0, db_1.connectDB)();
        const listing = await db
            .collection(COLLECTION)
            .findOne({ _id: new mongodb_1.ObjectId(id) });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }
        if (listing.hostId !== req.user.id) {
            return res
                .status(403)
                .json({ message: "You can only delete your own listings." });
        }
        await db
            .collection(COLLECTION)
            .deleteOne({ _id: new mongodb_1.ObjectId(id) });
        return res.json({ message: "Listing deleted successfully." });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to delete listing." });
    }
}
