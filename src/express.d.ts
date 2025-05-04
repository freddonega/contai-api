import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}

export {};

const test: number = "This should cause a type error";
