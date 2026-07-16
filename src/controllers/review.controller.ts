import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db";
import { Review, CreateReviewInput } from "../types/review";
import { Listing } from "../types/listing";
import { getParam } from "../utils/params";

const REVIEWS = "reviews";
const LISTINGS = "listings";

export async function createReview(req: Request, res: Response) {
  try {
    const body = req.body as CreateReviewInput;

    if (!body.listingId || !ObjectId.isValid(body.listingId)) {
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

    const db = await connectDB();
    const listing = await db
      .collection<Listing>(LISTINGS)
      .findOne({ _id: new ObjectId(body.listingId) });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    const newReview: Review = {
      listingId: body.listingId,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: body.rating,
      comment: body.comment.trim(),
      createdAt: new Date(),
    };

    const result = await db.collection<Review>(REVIEWS).insertOne(newReview);

    const allReviews = await db
      .collection<Review>(REVIEWS)
      .find({ listingId: body.listingId })
      .toArray();
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await db.collection<Listing>(LISTINGS).updateOne(
      { _id: new ObjectId(body.listingId) },
      {
        $set: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      },
    );

    return res.status(201).json({ _id: result.insertedId, ...newReview });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create review." });
  }
}

export async function getReviewsForListing(req: Request, res: Response) {
  try {
    const listingId = getParam(req, "listingId");
    if (!listingId || !ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid listing id." });
    }

    const db = await connectDB();
    const items = await db
      .collection<Review>(REVIEWS)
      .find({ listingId })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch reviews." });
  }
}
