import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import {
  getAllUsersAdmin,
  deleteUserAdmin,
  getAllListingsAdmin,
  deleteListingAdmin,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", getAllUsersAdmin);
router.delete("/users/:id", deleteUserAdmin);
router.get("/listings", getAllListingsAdmin);
router.delete("/listings/:id", deleteListingAdmin);

export default router;
