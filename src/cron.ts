import cron from "node-cron";
import { processRecurringEntries } from "./jobs/processRecurringEntries";

cron.schedule("0 0 * * *", async () => {
  console.log("Executando job de lançamentos recorrentes...");
  await processRecurringEntries();
  console.log("Job finalizado.");
});
