import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req.user as unknown as { role?: string })?.role;

  if (role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}
