import { PrismaClient, PaymentType } from "@prisma/client";

const prisma = new PrismaClient();

export const createPaymentType = async (
  data: Omit<PaymentType, "id" | "created_at" | "updated_at">
): Promise<PaymentType> => {
  return prisma.paymentType.create({
    data,
  });
};

interface ListPaymentTypesParams {
  user_id: string;
}

export const listPaymentTypes = async ({
  user_id,
}: ListPaymentTypesParams) => {
  const payment_types = await prisma.paymentType.findMany({
    where: { user_id },
  });

  return payment_types;
};

export const getPaymentType = async (
  id: string,
  user_id: string
): Promise<PaymentType | null> => {
  return prisma.paymentType.findFirst({
    where: { id, user_id },
  });
};

export const updatePaymentType = async (
  id: string,
  data: Partial<PaymentType> & { user_id: string }
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
  id: string,
  user_id: string
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
