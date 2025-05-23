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

const listPaymentTypesSchema = z.object({
  search: z.string().optional(),
});

export const createPaymentTypeController = async (
  req: Request,
  res: Response
) => {
  try {
    const paymentTypeData = paymentTypeSchema.parse(req.body);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const paymentType = await createPaymentType({
      ...paymentTypeData,
      user_id,
    });
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
    const user_id = req.user?.id;
    const queryData = listPaymentTypesSchema.parse(req.query);

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const payment_types = await listPaymentTypes({
      user_id,
    });

    res.json(payment_types);
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const getPaymentTypeController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const paymentType = await getPaymentType(id, user_id);

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
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const paymentType = await getPaymentType(id, user_id);

    if (!paymentType) {
      res.status(404).json({ error: "Tipo de pagamento não encontrado" });
      return;
    }

    const updatedPaymentType = await updatePaymentType(id, {
      ...paymentTypeData,
      user_id,
    });
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
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const paymentType = await getPaymentType(id, user_id);

    if (!paymentType) {
      res.status(404).json({ error: "Tipo de pagamento não encontrado" });
      return;
    }

    await deletePaymentType(id, user_id);
    res.json({ message: "Tipo de pagamento deletado" });
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};
