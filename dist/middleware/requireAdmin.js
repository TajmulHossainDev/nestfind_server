"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
function requireAdmin(req, res, next) {
    const role = req.user?.role;
    if (role !== "admin") {
        return res.status(403).json({ message: "Admin access required." });
    }
    next();
}
