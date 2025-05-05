import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const listCostCentersSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().min(1).default(1)),
  items_per_page: z.preprocess(
    (val) => Number(val || 10),
    z.number().min(1).default(10)
  ),
  sort_by: z.union([z.string(), z.array(z.string())]).optional(),
  sort_order: z.union([z.enum(["asc", "desc"]), z.array(z.enum(["asc", "desc"]))]).optional(),
});

export const createCostCenterController = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const user_id = req.user?.id;

    if (!name) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }

    if (!user_id) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    const costCenter = await prisma.costCenter.create({
      data: {
        name,
        user: {
          connect: {
            id: user_id,
          },
        },
      },
    });

    res.json(costCenter);
  } catch (error) {
    console.error("Error creating cost center:", error);
    res.status(500).json({ error: "Erro ao criar centro de custo" });
  }
};

export const listCostCentersController = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;
    const queryData = listCostCentersSchema.parse(req.query);

    if (!user_id) {
      res.status(401).json({ error: "Usuário não autenticado" });
      return;
    }

    const where = {
      user_id,
    };

    const sortByArray = Array.isArray(queryData.sort_by) ? queryData.sort_by : queryData.sort_by ? [queryData.sort_by] : undefined;
    const sortOrderArray = Array.isArray(queryData.sort_order) ? queryData.sort_order : queryData.sort_order ? [queryData.sort_order] : undefined;

    const orderBy = sortByArray?.map((field: string, index: number) => ({
      [field]: sortOrderArray?.[index] || "asc",
    })) || [{ name: "asc" }];

    const [costCenters, total] = await prisma.$transaction([
      prisma.costCenter.findMany({
        where,
        orderBy,
        skip: (queryData.page - 1) * queryData.items_per_page,
        take: queryData.items_per_page,
      }),
      prisma.costCenter.count({ where }),
    ]);

    res.json({
      cost_centers: costCenters,
      total,
      page: queryData.page,
      items_per_page: queryData.items_per_page,
      sort_by: queryData.sort_by,
      sort_order: queryData.sort_order,
    });
  } catch (error) {
    console.error("Error listing cost centers:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro ao listar centros de custo" });
    }
  }
};

export const getCostCenterController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    const costCenter = await prisma.costCenter.findFirst({
      where: {
        id,
        user_id,
      },
    });

    if (!costCenter) {
      res.status(404).json({ error: "Centro de custo não encontrado" });
      return;
    }

    res.json(costCenter);
  } catch (error) {
    console.error("Error getting cost center:", error);
    res.status(500).json({ error: "Erro ao buscar centro de custo" });
  }
};

export const updateCostCenterController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const user_id = req.user?.id;

    if (!name) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }

    const costCenter = await prisma.costCenter.findFirst({
      where: {
        id,
        user_id,
      },
    });

    if (!costCenter) {
      res.status(404).json({ error: "Centro de custo não encontrado" });
      return;
    }

    const updatedCostCenter = await prisma.costCenter.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });

    res.json(updatedCostCenter);
  } catch (error) {
    console.error("Error updating cost center:", error);
    res.status(500).json({ error: "Erro ao atualizar centro de custo" });
  }
};

export const deleteCostCenterController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    const costCenter = await prisma.costCenter.findFirst({
      where: {
        id,
        user_id,
      },
      include: {
        categories: true,
      },
    });

    if (!costCenter) {
      res.status(404).json({ error: "Centro de custo não encontrado" });
      return;
    }

    if (costCenter.categories.length > 0) {
      res.status(400).json({
        error: "Não é possível excluir um centro de custo que possui categorias vinculadas",
      });
      return;
    }

    await prisma.costCenter.delete({
      where: {
        id,
      },
    });

    res.json({ message: "Centro de custo excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting cost center:", error);
    res.status(500).json({ error: "Erro ao excluir centro de custo" });
  }
}; 