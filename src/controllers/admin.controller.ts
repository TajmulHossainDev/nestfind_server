import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db";
import { Listing } from "../types/listing";
import { getParam } from "../utils/params";

export async function getAllUsersAdmin(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const users = await db
      .collection("user")
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ items: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
}

export async function deleteUserAdmin(req: Request, res: Response) {
  try {
    const id = getParam(req, "id");
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id." });
    }

    const db = await connectDB();
    await db.collection("user").deleteOne({ _id: new ObjectId(id) });

    return res.json({ message: "User deleted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete user." });
  }
}

export async function getAllListingsAdmin(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const items = await db
      .collection<Listing>("listings")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch listings." });
  }
}

export async function deleteListingAdmin(req: Request, res: Response) {
  try {
    const id = getParam(req, "id");
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing id." });
    }

    const db = await connectDB();
    await db
      .collection<Listing>("listings")
      .deleteOne({ _id: new ObjectId(id) });

    return res.json({ message: "Listing deleted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete listing." });
  }
}
