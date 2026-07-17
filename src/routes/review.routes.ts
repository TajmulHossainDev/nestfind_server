import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  createReview,
  getReviewsForListing,
} from "../controllers/review.controller.js";

const router = Router();

router.get("/:listingId", getReviewsForListing);
router.post("/", requireAuth, createReview);

export default router;
