import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { Wishlist } from "../types/wishlist.js";
import { Listing } from "../types/listing.js";

const WISHLIST = "wishlist";
const LISTINGS = "listings";

export async function getMyWishlistIds(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const items = await db
      .collection<Wishlist>(WISHLIST)
      .find({ userId: req.user!.id })
      .toArray();

    return res.json({ listingIds: items.map((w) => w.listingId) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch wishlist." });
  }
}

export async function getMyWishlistFull(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const wishlistItems = await db
      .collection<Wishlist>(WISHLIST)
      .find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .toArray();

    const listingIds = wishlistItems.map((w) => new ObjectId(w.listingId));
    const listings = await db
      .collection<Listing>(LISTINGS)
      .find({ _id: { $in: listingIds } })
      .toArray();

    return res.json({ items: listings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch wishlist." });
  }
}

export async function toggleWishlist(req: Request, res: Response) {
  try {
    const { listingId } = req.body;

    if (!listingId || !ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Valid listingId is required." });
    }

    const db = await connectDB();
    const userId = req.user!.id;

    const existing = await db
      .collection<Wishlist>(WISHLIST)
      .findOne({ userId, listingId });

    if (existing) {
      await db.collection<Wishlist>(WISHLIST).deleteOne({ _id: existing._id });
      return res.json({ status: "removed" });
    }

    await db.collection<Wishlist>(WISHLIST).insertOne({
      userId,
      listingId,
      createdAt: new Date(),
    });
    return res.json({ status: "added" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update wishlist." });
  }
}
