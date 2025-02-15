/*
  Warnings:

  - A unique constraint covering the columns `[name,type,user_id]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_name_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_type_user_id_key" ON "Category"("name", "type", "user_id");
