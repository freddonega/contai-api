import { PrismaClient, PaymentType } from "@prisma/client";

const prisma = new PrismaClient();

export const createPaymentType = async (
  data: Omit<PaymentType, "id" | "created_at" | "updated_at">
): Promise<PaymentType> => {
  return prisma.paymentType.create({
    data,
  });
};

export const listPaymentTypes = async (): Promise<PaymentType[]> => {
  return prisma.paymentType.findMany();
};

export const getPaymentType = async (
  id: number
): Promise<PaymentType | null> => {
  return prisma.paymentType.findUnique({
    where: { id },
  });
};

export const updatePaymentType = async (
  id: number,
  data: Partial<PaymentType>
): Promise<PaymentType> => {
  return prisma.paymentType.update({
    where: { id },
    data,
  });
};

export const deletePaymentType = async (id: number): Promise<void> => {
  await prisma.paymentType.delete({
    where: { id },
  });
};
