import { Router } from "express";
import {
  createPaymentTypeController,
  listPaymentTypesController,
  getPaymentTypeController,
  updatePaymentTypeController,
  deletePaymentTypeController,
} from "../controllers/paymentTypeController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PaymentTypes
 *   description: API para gerenciar tipos de pagamento
 */

/**
 * @swagger
 * /payment_types:
 *   post:
 *     summary: Cria um novo tipo de pagamento
 *     tags: [PaymentTypes]
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
 *         description: Tipo de pagamento criado com sucesso
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
router.post("/payment_types", authenticateToken, createPaymentTypeController);

/**
 * @swagger
 * /payment_types:
 *   get:
 *     summary: Lista todos os tipos de pagamento do usuário
 *     tags: [PaymentTypes]
 *     responses:
 *       200:
 *         description: Lista de tipos de pagamento
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/payment_types", authenticateToken, listPaymentTypesController);

/**
 * @swagger
 * /payment_types/{id}:
 *   get:
 *     summary: Obtém um tipo de pagamento pelo ID
 *     tags: [PaymentTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tipo de pagamento
 *     responses:
 *       200:
 *         description: Tipo de pagamento encontrado
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
 *         description: Tipo de pagamento não encontrado
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/payment_types/:id", authenticateToken, getPaymentTypeController);

/**
 * @swagger
 * /payment_types/{id}:
 *   put:
 *     summary: Atualiza um tipo de pagamento pelo ID
 *     tags: [PaymentTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tipo de pagamento
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
 *         description: Tipo de pagamento atualizado com sucesso
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
 *         description: Tipo de pagamento não encontrado
 *       500:
 *         description: Erro Interno do Servidor
 */
router.put(
  "/payment_types/:id",
  authenticateToken,
  updatePaymentTypeController
);

/**
 * @swagger
 * /payment_types/{id}:
 *   delete:
 *     summary: Exclui um tipo de pagamento pelo ID
 *     tags: [PaymentTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID do tipo de pagamento
 *     responses:
 *       200:
 *         description: Tipo de pagamento excluído com sucesso
 *       404:
 *         description: Tipo de pagamento não encontrado
 *       500:
 *         description: Erro Interno do Servidor
 */
router.delete(
  "/payment_types/:id",
  authenticateToken,
  deletePaymentTypeController
);

export default router;
