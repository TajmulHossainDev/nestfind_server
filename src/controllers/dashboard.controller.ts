import { Request, Response } from "express";
import { connectDB } from "../config/db.js";
import { Listing } from "../types/listing.js";
import { Booking } from "../types/booking.js";
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const userId = req.user!.id;

    const [listings, myBookings] = await Promise.all([
      db.collection<Listing>("listings").find({ hostId: userId }).toArray(),
      db.collection<Booking>("bookings").find({ userId }).toArray(),
    ]);

    const myListingIds = listings.map((l) => l._id!.toString());
    const bookingsOnMyListings = await db
      .collection<Booking>("bookings")
      .find({ listingId: { $in: myListingIds }, status: "confirmed" })
      .toArray();

    const totalRevenue = bookingsOnMyListings.reduce(
      (sum, b) => sum + b.totalPrice,
      0,
    );

    const monthlyRevenue: Record<string, number> = {};
    bookingsOnMyListings.forEach((b) => {
      const month = new Date(b.createdAt).toLocaleString("en-US", {
        month: "short",
      });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + b.totalPrice;
    });

    const chartData = Object.entries(monthlyRevenue).map(
      ([month, revenue]) => ({
        month,
        revenue,
      }),
    );

    return res.json({
      totalListings: listings.length,
      totalBookingsMade: myBookings.length,
      totalBookingsReceived: bookingsOnMyListings.length,
      totalRevenue,
      chartData,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load dashboard stats." });
  }
}
