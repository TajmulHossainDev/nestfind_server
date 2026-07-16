"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getMyBookings = getMyBookings;
exports.createCheckoutSession = createCheckoutSession;
exports.confirmBooking = confirmBooking;
const mongodb_1 = require("mongodb");
const db_1 = require("../config/db");
const stripe_1 = require("../lib/stripe");
const params_1 = require("../utils/params");
const BOOKINGS = "bookings";
const LISTINGS = "listings";
async function createBooking(req, res) {
    try {
        const body = req.body;
        if (!body.listingId || !body.checkIn || !body.checkOut) {
            return res
                .status(400)
                .json({ message: "listingId, checkIn, and checkOut are required." });
        }
        if (!mongodb_1.ObjectId.isValid(body.listingId)) {
            return res.status(400).json({ message: "Invalid listing id." });
        }
        const checkIn = new Date(body.checkIn);
        const checkOut = new Date(body.checkOut);
        if (isNaN(checkIn.getTime()) ||
            isNaN(checkOut.getTime()) ||
            checkOut <= checkIn) {
            return res
                .status(400)
                .json({ message: "checkOut must be a valid date after checkIn." });
        }
        const db = await (0, db_1.connectDB)();
        const listing = await db
            .collection(LISTINGS)
            .findOne({ _id: new mongodb_1.ObjectId(body.listingId) });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * listing.price;
        const newBooking = {
            listingId: body.listingId,
            userId: req.user.id,
            userName: req.user.name,
            checkIn,
            checkOut,
            totalPrice,
            status: "pending",
            createdAt: new Date(),
        };
        const result = await db.collection(BOOKINGS).insertOne(newBooking);
        return res.status(201).json({ _id: result.insertedId, ...newBooking });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to create booking." });
    }
}
async function getMyBookings(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const items = await db
            .collection(BOOKINGS)
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .toArray();
        return res.json({ items });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch your bookings." });
    }
}
async function createCheckoutSession(req, res) {
    try {
        const body = req.body;
        if (!body.listingId || !body.checkIn || !body.checkOut) {
            return res
                .status(400)
                .json({ message: "listingId, checkIn, and checkOut are required." });
        }
        if (!mongodb_1.ObjectId.isValid(body.listingId)) {
            return res.status(400).json({ message: "Invalid listing id." });
        }
        const checkIn = new Date(body.checkIn);
        const checkOut = new Date(body.checkOut);
        if (isNaN(checkIn.getTime()) ||
            isNaN(checkOut.getTime()) ||
            checkOut <= checkIn) {
            return res
                .status(400)
                .json({ message: "checkOut must be a valid date after checkIn." });
        }
        const db = await (0, db_1.connectDB)();
        const listing = await db
            .collection(LISTINGS)
            .findOne({ _id: new mongodb_1.ObjectId(body.listingId) });
        if (!listing) {
            return res.status(404).json({ message: "Listing not found." });
        }
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = nights * listing.price;
        const newBooking = {
            listingId: body.listingId,
            userId: req.user.id,
            userName: req.user.name,
            checkIn,
            checkOut,
            totalPrice,
            status: "pending",
            createdAt: new Date(),
        };
        const bookingResult = await db
            .collection(BOOKINGS)
            .insertOne(newBooking);
        const bookingId = bookingResult.insertedId.toString();
        const session = await stripe_1.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: listing.title,
                            description: `${nights} night(s) · ${listing.location}`,
                        },
                        unit_amount: Math.round(listing.price * 100),
                    },
                    quantity: nights,
                },
            ],
            metadata: {
                bookingId,
            },
            success_url: `${process.env.CLIENT_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/listings/${body.listingId}`,
        });
        return res.status(200).json({ url: session.url, bookingId });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to start checkout." });
    }
}
async function confirmBooking(req, res) {
    try {
        const sessionId = (0, params_1.getParam)(req, "sessionId");
        if (!sessionId) {
            return res.status(400).json({ message: "Invalid checkout session id." });
        }
        const session = await stripe_1.stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed." });
        }
        const bookingId = session.metadata?.bookingId;
        if (!bookingId || !mongodb_1.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid booking reference." });
        }
        const db = await (0, db_1.connectDB)();
        await db
            .collection(BOOKINGS)
            .updateOne({ _id: new mongodb_1.ObjectId(bookingId) }, { $set: { status: "confirmed" } });
        const booking = await db
            .collection(BOOKINGS)
            .findOne({ _id: new mongodb_1.ObjectId(bookingId) });
        return res.json({ booking });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to confirm booking." });
    }
}
