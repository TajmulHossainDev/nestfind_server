"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const review_controller_1 = require("../controllers/review.controller");
const router = (0, express_1.Router)();
router.get("/:listingId", review_controller_1.getReviewsForListing);
router.post("/", requireAuth_1.requireAuth, review_controller_1.createReview);
exports.default = router;
