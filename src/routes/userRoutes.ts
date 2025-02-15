import { Router } from "express";
import {
  createUserController,
  loginUserController,
} from "../controllers/userController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API para gerenciar usuários
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string // New field
 *             required:
 *               - email
 *               - password
 *               - name // New field
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string // New field
 *       400:
 *         description: Erro de validação
 */
router.post("/users", createUserController);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Faz login de um usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", loginUserController);

export default router;
