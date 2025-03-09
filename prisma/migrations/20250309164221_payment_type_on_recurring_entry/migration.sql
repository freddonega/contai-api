-- AlterTable
ALTER TABLE "RecurringEntry" ADD COLUMN     "payment_type_id" INTEGER;

-- AddForeignKey
ALTER TABLE "RecurringEntry" ADD CONSTRAINT "RecurringEntry_payment_type_id_fkey" FOREIGN KEY ("payment_type_id") REFERENCES "PaymentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
