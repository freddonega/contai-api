import { PrismaClient, PaymentType } from "@prisma/client";

const prisma = new PrismaClient();

export const createPaymentType = async (
  data: Omit<PaymentType, "id" | "created_at" | "updated_at"> & {
    user_id: number;
  }
): Promise<PaymentType> => {
  return prisma.paymentType.create({
    data,
  });
};

export const listPaymentTypes = async (
  user_id: number
): Promise<PaymentType[]> => {
  return prisma.paymentType.findMany({
    where: { user_id },
  });
};

export const getPaymentType = async (
  id: number,
  user_id: number
): Promise<PaymentType | null> => {
  return prisma.paymentType.findFirst({
    where: { id, user_id },
  });
};

export const updatePaymentType = async (
  id: number,
  data: Partial<PaymentType> & { user_id: number }
): Promise<PaymentType> => {
  const paymentType = await prisma.paymentType.findFirst({
    where: { id, user_id: data.user_id },
  });

  if (!paymentType) {
    throw new Error(
      "Tipo de pagamento não encontrado ou não pertence ao usuário"
    );
  }

  return prisma.paymentType.update({
    where: { id },
    data,
  });
};

export const deletePaymentType = async (
  id: number,
  user_id: number
): Promise<void> => {
  const paymentType = await prisma.paymentType.findFirst({
    where: { id, user_id },
  });

  if (!paymentType) {
    throw new Error(
      "Tipo de pagamento não encontrado ou não pertence ao usuário"
    );
  }

  await prisma.paymentType.delete({
    where: { id },
  });
};
