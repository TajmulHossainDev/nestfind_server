import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getAllUsersAdmin,
  deleteUserAdmin,
  getAllListingsAdmin,
  deleteListingAdmin,
} from "../controllers/admin.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", getAllUsersAdmin);
router.delete("/users/:id", deleteUserAdmin);
router.get("/listings", getAllListingsAdmin);
router.delete("/listings/:id", deleteListingAdmin);

export default router;
