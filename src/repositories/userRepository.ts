import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

export const createUser = async (
  data: Omit<User, "id" | "created_at" | "updated_at">
): Promise<User> => {
  return prisma.user.create({
    data,
    include: {
      entries: true,
      categories: true,
    },
  });
};

export const findUserByEmail = async (
  email: string
): Promise<User | null | undefined> => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      entries: true,
      categories: true,
    },
  });
};
