import express from "express";
import { processRecurringEntries } from "../jobs/processRecurringEntries";

const router = express.Router();

/**
 * @swagger
 * /jobs/process_recurring_entries:
 *   post:
 *     summary: Processa lançamentos recorrentes
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: Lançamentos recorrentes processados com sucesso
 *       500:
 *         description: Erro ao processar lançamentos recorrentes
 */
router.post("/jobs/process_recurring_entries", async (req, res) => {
  try {
    await processRecurringEntries();
    res
      .status(200)
      .json({ message: "Lançamentos recorrentes processados com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erro ao processar lançamentos recorrentes" });
  }
});

export default router;
