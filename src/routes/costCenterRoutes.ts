import { Router } from "express";
import {
  createCostCenterController,
  listCostCentersController,
  getCostCenterController,
  updateCostCenterController,
  deleteCostCenterController,
} from "../controllers/costCenterController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cost Centers
 *   description: API para gerenciar centros de custo
 */

/**
 * @swagger
 * /cost-center:
 *   post:
 *     summary: Cria um novo centro de custo
 *     tags: [Cost Centers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Centro de custo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro Interno do Servidor
 */
router.post("/cost-center", authenticateToken, createCostCenterController);

/**
 * @swagger
 * /cost-center:
 *   get:
 *     summary: Lista todos os centros de custo do usuário
 *     tags: [Cost Centers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: items_per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *         description: Campo para ordenação
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Ordem da ordenação
 *     responses:
 *       200:
 *         description: Lista de centros de custo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cost_centers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 items_per_page:
 *                   type: integer
 *                 sort_by:
 *                   type: string
 *                 sort_order:
 *                   type: string
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/cost-center", authenticateToken, listCostCentersController);

/**
 * @swagger
 * /cost-center/{id}:
 *   get:
 *     summary: Obtém um centro de custo pelo ID
 *     tags: [Cost Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do centro de custo
 *     responses:
 *       200:
 *         description: Centro de custo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Centro de custo não encontrado
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/cost-center/:id", authenticateToken, getCostCenterController);

/**
 * @swagger
 * /cost-center/{id}:
 *   put:
 *     summary: Atualiza um centro de custo pelo ID
 *     tags: [Cost Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do centro de custo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Centro de custo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Centro de custo não encontrado
 *       500:
 *         description: Erro Interno do Servidor
 */
router.put("/cost-center/:id", authenticateToken, updateCostCenterController);

/**
 * @swagger
 * /cost-center/{id}:
 *   delete:
 *     summary: Exclui um centro de custo pelo ID
 *     tags: [Cost Centers]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do centro de custo
 *     responses:
 *       200:
 *         description: Centro de custo excluído com sucesso
 *       404:
 *         description: Centro de custo não encontrado
 *       500:
 *         description: Erro Interno do Servidor
 */
router.delete("/cost-center/:id", authenticateToken, deleteCostCenterController);

export default router; 