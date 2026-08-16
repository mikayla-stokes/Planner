/*
  Warnings:

  - You are about to drop the `ExerciseEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FoodEntry` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ExerciseEntry" DROP CONSTRAINT "ExerciseEntry_profileId_fkey";

-- DropForeignKey
ALTER TABLE "FoodEntry" DROP CONSTRAINT "FoodEntry_profileId_fkey";

-- DropTable
DROP TABLE "ExerciseEntry";

-- DropTable
DROP TABLE "FoodEntry";
