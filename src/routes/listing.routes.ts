import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createListing,
  getListings,
  getListingById,
  getMyListings,
  deleteListing,
} from "../controllers/listing.controller";

const router = Router();

router.get("/", getListings);

router.get("/mine", requireAuth, getMyListings);

router.get("/:id", getListingById);

router.post("/", requireAuth, createListing);
router.delete("/:id", requireAuth, deleteListing);

export default router;
