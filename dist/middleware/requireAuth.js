"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
exports.requireAuth = requireAuth;
const node_1 = require("better-auth/node");
const auth_1 = require("../lib/auth");
function requireAdmin(req, res, next) {
    const role = req.user?.role;
    if (role !== "admin") {
        return res.status(403).json({ message: "Admin access required." });
    }
    next();
}
async function requireAuth(req, res, next) {
    try {
        const session = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (!session) {
            return res.status(401).json({ message: "Unauthorized. Please log in." });
        }
        req.user = session.user;
        req.session = session.session;
        next();
    }
    catch (err) {
        console.error("Auth check failed:", err);
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
}
