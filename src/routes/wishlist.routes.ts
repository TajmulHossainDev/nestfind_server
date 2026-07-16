import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getMyWishlistIds,
  getMyWishlistFull,
  toggleWishlist,
} from "../controllers/wishlist.controller";

const router = Router();

router.use(requireAuth);

router.get("/mine/ids", getMyWishlistIds);
router.get("/mine", getMyWishlistFull);
router.post("/toggle", toggleWishlist);

export default router;
