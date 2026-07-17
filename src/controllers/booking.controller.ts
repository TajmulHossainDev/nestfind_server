import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { Booking, CreateBookingInput } from "../types/booking.js";
import { Listing } from "../types/listing.js";
import { stripe } from "../lib/stripe.js";
import { getParam } from "../utils/params.js";

const BOOKINGS = "bookings";
const LISTINGS = "listings";

export async function createBooking(req: Request, res: Response) {
  try {
    const body = req.body as CreateBookingInput;

    if (!body.listingId || !body.checkIn || !body.checkOut) {
      return res
        .status(400)
        .json({ message: "listingId, checkIn, and checkOut are required." });
    }
    if (!ObjectId.isValid(body.listingId)) {
      return res.status(400).json({ message: "Invalid listing id." });
    }

    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkOut <= checkIn
    ) {
      return res
        .status(400)
        .json({ message: "checkOut must be a valid date after checkIn." });
    }

    const db = await connectDB();
    const listing = await db
      .collection<Listing>(LISTINGS)
      .findOne({ _id: new ObjectId(body.listingId) });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = nights * listing.price;

    const newBooking: Booking = {
      listingId: body.listingId,
      userId: req.user!.id,
      userName: req.user!.name,
      checkIn,
      checkOut,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection<Booking>(BOOKINGS).insertOne(newBooking);
    return res.status(201).json({ _id: result.insertedId, ...newBooking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create booking." });
  }
}

export async function getMyBookings(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const items = await db
      .collection<Booking>(BOOKINGS)
      .find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch your bookings." });
  }
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const body = req.body as CreateBookingInput;

    if (!body.listingId || !body.checkIn || !body.checkOut) {
      return res
        .status(400)
        .json({ message: "listingId, checkIn, and checkOut are required." });
    }
    if (!ObjectId.isValid(body.listingId)) {
      return res.status(400).json({ message: "Invalid listing id." });
    }

    const checkIn = new Date(body.checkIn);
    const checkOut = new Date(body.checkOut);

    if (
      isNaN(checkIn.getTime()) ||
      isNaN(checkOut.getTime()) ||
      checkOut <= checkIn
    ) {
      return res
        .status(400)
        .json({ message: "checkOut must be a valid date after checkIn." });
    }

    const db = await connectDB();
    const listing = await db
      .collection<Listing>(LISTINGS)
      .findOne({ _id: new ObjectId(body.listingId) });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = nights * listing.price;

    const newBooking: Booking = {
      listingId: body.listingId,
      userId: req.user!.id,
      userName: req.user!.name,
      checkIn,
      checkOut,
      totalPrice,
      status: "pending",
      createdAt: new Date(),
    };
    const bookingResult = await db
      .collection<Booking>(BOOKINGS)
      .insertOne(newBooking);
    const bookingId = bookingResult.insertedId.toString();

    const session = await stripe.checkout.sessions.create({
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to start checkout." });
  }
}

export async function confirmBooking(req: Request, res: Response) {
  try {
    const sessionId = getParam(req, "sessionId");
    if (!sessionId) {
      return res.status(400).json({ message: "Invalid checkout session id." });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed." });
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking reference." });
    }

    const db = await connectDB();
    await db
      .collection<Booking>(BOOKINGS)
      .updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: { status: "confirmed" } },
      );

    const booking = await db
      .collection<Booking>(BOOKINGS)
      .findOne({ _id: new ObjectId(bookingId) });

    return res.json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to confirm booking." });
  }
}
