"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
const listing_routes_1 = __importDefault(require("./routes/listing.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const wishlist_routes_1 = __importDefault(require("./routes/wishlist.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.all("/api/auth/{*any}", (0, node_1.toNodeHandler)(auth_1.auth));
app.use(express_1.default.json());
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/listings", listing_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/dashboard", dashboard_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/wishlist", wishlist_routes_1.default);
exports.default = app;
