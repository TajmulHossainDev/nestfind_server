import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createBooking,
  getMyBookings,
  createCheckoutSession,
  confirmBooking,
} from "../controllers/booking.controller";

const router = Router();

router.post("/", requireAuth, createBooking);
router.get("/mine", requireAuth, getMyBookings);
router.post("/checkout", requireAuth, createCheckoutSession);
router.get("/confirm/:sessionId", requireAuth, confirmBooking);

export default router;
