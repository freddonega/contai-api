import { Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import { createUser, findUserByEmail } from "../repositories/userRepository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(), // New field
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const secret = process.env.JWT_SECRET || "your_jwt_secret";

export const createUserController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userData = userSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await createUser({ ...userData, password: hashedPassword });
    res.json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const loginUserController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const loginData = loginSchema.parse(req.body);
    const user = await findUserByEmail(loginData.email);

    if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
      res.status(401).json({ error: "Credenciais inválidas" });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: "1d",
    });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
