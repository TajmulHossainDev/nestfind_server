import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db";
import { CreateListingInput, Listing } from "../types/listing";
import { getParam } from "../utils/params";

const COLLECTION = "listings";

export async function createListing(req: Request, res: Response) {
  try {
    const body = req.body as CreateListingInput;

    if (
      !body.title ||
      !body.shortDescription ||
      !body.fullDescription ||
      !body.location
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (typeof body.price !== "number" || body.price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number." });
    }

    const db = await connectDB();

    const newListing: Listing = {
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
      hostId: req.user!.id,
      hostName: req.user!.name,
      createdAt: new Date(),
    };

    const result = await db
      .collection<Listing>(COLLECTION)
      .insertOne(newListing);
    return res.status(201).json({ _id: result.insertedId, ...newListing });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create listing." });
  }
}

export async function getListings(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const {
      search,
      category,
      maxPrice,
      sort,
      page = "1",
      limit = "8",
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search as string, $options: "i" } },
        { location: { $regex: search as string, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (maxPrice) {
      filter.price = { $lte: Number(maxPrice) };
    }

    let sortQuery: Record<string, 1 | -1> = {};
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

    const collection = db.collection<Listing>(COLLECTION);
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch listings." });
  }
}

export async function getListingById(req: Request, res: Response) {
  try {
    const id = getParam(req, "id");
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing id." });
    }

    const db = await connectDB();
    const listing = await db
      .collection<Listing>(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    return res.json(listing);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch listing." });
  }
}

export async function getMyListings(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const items = await db
      .collection<Listing>(COLLECTION)
      .find({ hostId: req.user!.id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch your listings." });
  }
}

export async function deleteListing(req: Request, res: Response) {
  try {
    const id = getParam(req, "id");
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing id." });
    }

    const db = await connectDB();
    const listing = await db
      .collection<Listing>(COLLECTION)
      .findOne({ _id: new ObjectId(id) });

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }
    if (listing.hostId !== req.user!.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own listings." });
    }

    await db
      .collection<Listing>(COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });
    return res.json({ message: "Listing deleted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete listing." });
  }
}
