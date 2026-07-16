import { Request } from "express";
export function getParam(req: Request, name: string): string | null {
  const value = req.params[name];
  return typeof value === "string" ? value : null;
}
