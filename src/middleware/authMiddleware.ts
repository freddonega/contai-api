import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare module "express" {
  interface Request {
    user?: Omit<User, "password" | "created_at" | "updated_at">;
  }
}

const secret = process.env.JWT_SECRET || "your_jwt_secret";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      res.status(401).json({ message: "Failed to authenticate token" });
      return;
    }
    req.user = user as { id: string; email: string; name: string };
    next();
  });
};
