import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/index";
import { beforeAll, afterAll, describe, it, expect } from "@jest/globals";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "your_jwt_secret";

beforeAll(async () => {
  await prisma.entry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const generateToken = (user: { id: number; email: string }) => {
  return jwt.sign(user, secret, { expiresIn: "1h" });
};

const createUserAndLogin = async (email: string, password: string) => {
  await request(app).post("/users").send({ email, password });
  const response = await request(app).post("/login").send({ email, password });
  return response.body.token;
};

describe("POST /categories", () => {
  it("should create a new category", async () => {
    const email = "test2@example.com";
    const password = "password123";
    const token = await createUserAndLogin(email, password);

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Food",
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Food");
  });
});

describe("POST /entries", () => {
  it("should create a new entry", async () => {
    const email = "test3@example.com";
    const password = "password123";
    const token = await createUserAndLogin(email, password);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user?.id) {
      throw new Error("User ID is undefined");
    }

    const category = await prisma.category.create({
      data: {
        name: "Transport",
        user_id: user.id,
      },
    });

    const response = await request(app)
      .post("/entries")
      .set("Authorization", `Bearer ${token}`)
      .send({
        amount: 50.0,
        type: "expense",
        category_id: category.id,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.amount).toBe(50.0);
  });
});
