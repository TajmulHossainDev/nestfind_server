"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const db_1 = require("../config/db");
async function getDashboardStats(req, res) {
    try {
        const db = await (0, db_1.connectDB)();
        const userId = req.user.id;
        const [listings, myBookings] = await Promise.all([
            db.collection("listings").find({ hostId: userId }).toArray(),
            db.collection("bookings").find({ userId }).toArray(),
        ]);
        const myListingIds = listings.map((l) => l._id.toString());
        const bookingsOnMyListings = await db
            .collection("bookings")
            .find({ listingId: { $in: myListingIds }, status: "confirmed" })
            .toArray();
        const totalRevenue = bookingsOnMyListings.reduce((sum, b) => sum + b.totalPrice, 0);
        const monthlyRevenue = {};
        bookingsOnMyListings.forEach((b) => {
            const month = new Date(b.createdAt).toLocaleString("en-US", {
                month: "short",
            });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + b.totalPrice;
        });
        const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
            month,
            revenue,
        }));
        return res.json({
            totalListings: listings.length,
            totalBookingsMade: myBookings.length,
            totalBookingsReceived: bookingsOnMyListings.length,
            totalRevenue,
            chartData,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to load dashboard stats." });
    }
}
