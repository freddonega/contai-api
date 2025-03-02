import { Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  createPaymentType,
  listPaymentTypes,
  getPaymentType,
  updatePaymentType,
  deletePaymentType,
} from "../repositories/paymentTypeRepository";

const paymentTypeSchema = z.object({
  name: z.string(),
});

export const createPaymentTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentTypeData = paymentTypeSchema.parse(req.body);
    const paymentType = await createPaymentType(paymentTypeData);
    res.json(paymentType);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const listPaymentTypesController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentTypes = await listPaymentTypes();
    res.json(paymentTypes);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};

export const getPaymentTypeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const paymentType = await getPaymentType(parseInt(id));

    if (!paymentType) {
      res.status(404).json({ error: "Tipo de pagamento não encontrado" });
      return;
    }
    res.json(paymentType);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};

export const updatePaymentTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const paymentTypeData = paymentTypeSchema.parse(req.body);
    const paymentType = await getPaymentType(parseInt(id));

    if (!paymentType) {
      res.status(404).json({ error: "Tipo de pagamento não encontrado" });
      return;
    }

    const updatedPaymentType = await updatePaymentType(
      parseInt(id),
      paymentTypeData
    );
    res.json(updatedPaymentType);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const deletePaymentTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const paymentType = await getPaymentType(parseInt(id));

    if (!paymentType) {
      res.status(404).json({ error: "Tipo de pagamento não encontrado" });
      return;
    }

    await deletePaymentType(parseInt(id));
    res.json({ message: "Tipo de pagamento deletado" });
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};
