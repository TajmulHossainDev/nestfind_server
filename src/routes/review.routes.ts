import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createReview,
  getReviewsForListing,
} from "../controllers/review.controller";

const router = Router();

router.get("/:listingId", getReviewsForListing);
router.post("/", requireAuth, createReview);

export default router;
