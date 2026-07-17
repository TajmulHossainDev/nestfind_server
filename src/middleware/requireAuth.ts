import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req.user as unknown as { role?: string })?.role;

  if (role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (err) {
    console.error("Auth check failed:", err);
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
}
