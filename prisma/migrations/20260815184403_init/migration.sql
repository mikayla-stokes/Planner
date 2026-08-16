-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "CalendarCategory" AS ENUM ('WEDDING', 'FAMILY', 'PERSONAL', 'WORK', 'CALEB_ONLY');

-- CreateEnum
CREATE TYPE "ChecklistOwner" AS ENUM ('MIKAYLA', 'CALEB', 'SHARED', 'UNDECIDED');

-- CreateEnum
CREATE TYPE "GuestHost" AS ENUM ('BRIDE', 'GROOM', 'BOTH');

-- CreateEnum
CREATE TYPE "GuestType" AS ENUM ('FAMILY', 'FRIENDS', 'PLUS_ONE', 'COLLEAGUES');

-- CreateEnum
CREATE TYPE "RsvpExpectation" AS ENUM ('YES', 'NO', 'UNSURE');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('YES', 'NO', 'PENDING');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('EXPENSE', 'INCOME');

-- CreateEnum
CREATE TYPE "TimelineSubEvent" AS ENUM ('WEDDING_DAY', 'BACHELORETTE_WEEKEND');

-- CreateEnum
CREATE TYPE "PackingListType" AS ENUM ('WEDDING', 'HONEYMOON', 'BACHELORETTE');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntityTag" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,

    CONSTRAINT "EntityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wedding" (
    "id" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "brideName" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "bridePhone" TEXT,
    "groomPhone" TEXT,
    "venueName" TEXT,
    "ceremonyLocation" TEXT,
    "receptionLocation" TEXT,
    "estimatedGuestCountLow" INTEGER,
    "estimatedGuestCountHigh" INTEGER,

    CONSTRAINT "Wedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "roomRate" TEXT,
    "includedAmenities" TEXT[],
    "excludedAmenities" TEXT[],
    "notes" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistMilestone" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "monthsOut" INTEGER,
    "fixedDate" TIMESTAMP(3),

    CONSTRAINT "ChecklistMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "owner" "ChecklistOwner" NOT NULL,
    "title" TEXT NOT NULL,
    "parentItemId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "Priority",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingTable" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SeatingTable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "tableId" TEXT,
    "host" "GuestHost" NOT NULL,
    "type" "GuestType" NOT NULL,
    "role" TEXT,
    "events" TEXT[],
    "saveTheDateSent" BOOLEAN NOT NULL DEFAULT false,
    "inviteSent" BOOLEAN NOT NULL DEFAULT false,
    "isKid" BOOLEAN NOT NULL DEFAULT false,
    "expectedRsvp" "RsvpExpectation",
    "rsvpStatus" "RsvpStatus" NOT NULL DEFAULT 'PENDING',
    "phone" TEXT,
    "email" TEXT,
    "addressedTo" TEXT,
    "address" TEXT,
    "cityZip" TEXT,
    "arrivalDate" TEXT,
    "dietaryPreferences" TEXT,
    "notes" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewNote" TEXT,
    "isWeddingParty" BOOLEAN NOT NULL DEFAULT false,
    "weddingPartyRole" TEXT,
    "weddingSide" TEXT,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BridalPartyProfile" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "phone" TEXT,
    "mailingAddress" TEXT,
    "favoriteSnack" TEXT,
    "favoriteColor" TEXT,
    "favoriteFoods" TEXT,
    "favoriteDrinks" TEXT,
    "thingsYouEnjoy" TEXT,
    "shirtSize" TEXT,
    "pantSize" TEXT,
    "dressSize" TEXT,
    "shoeSize" TEXT,
    "allergies" TEXT,
    "dietaryRestrictions" TEXT,
    "notes" TEXT,

    CONSTRAINT "BridalPartyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HairMakeupSignup" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "wantsHair" BOOLEAN NOT NULL DEFAULT false,
    "wantsMakeup" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HairMakeupSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vendorType" TEXT NOT NULL,
    "officialChoice" BOOLEAN NOT NULL DEFAULT false,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "events" TEXT[],
    "pricing" TEXT,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contacted" BOOLEAN NOT NULL DEFAULT false,
    "appointmentScheduled" BOOLEAN NOT NULL DEFAULT false,
    "packageDetails" TEXT,
    "notes" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingBudgetItem" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "priorityLevel" TEXT,
    "category" TEXT NOT NULL,
    "estimatedCost" DECIMAL(10,2),
    "budget" DECIMAL(10,2),
    "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "amountRemaining" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "WeddingBudgetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeddingExpense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "purchasedFrom" TEXT,
    "description" TEXT,
    "type" "ExpenseType" NOT NULL DEFAULT 'EXPENSE',

    CONSTRAINT "WeddingExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL,
    "subEvent" "TimelineSubEvent" NOT NULL,
    "time" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingList" (
    "id" TEXT NOT NULL,
    "type" "PackingListType" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "PackingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "subcategory" TEXT,
    "checked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PackingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestMessageTemplate" (
    "id" TEXT NOT NULL,
    "triggerLabel" TEXT,
    "body" TEXT NOT NULL,
    "audience" TEXT,

    CONSTRAINT "GuestMessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_name_key" ON "Profile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "EntityTag_entityType_entityId_idx" ON "EntityTag"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityTag_tagId_entityType_entityId_key" ON "EntityTag"("tagId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "ChecklistItem_milestoneId_idx" ON "ChecklistItem"("milestoneId");

-- CreateIndex
CREATE INDEX "ChecklistItem_parentItemId_idx" ON "ChecklistItem"("parentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatingTable_name_key" ON "SeatingTable"("name");

-- CreateIndex
CREATE INDEX "Guest_tableId_idx" ON "Guest"("tableId");

-- CreateIndex
CREATE INDEX "Guest_lastName_firstName_idx" ON "Guest"("lastName", "firstName");

-- CreateIndex
CREATE UNIQUE INDEX "BridalPartyProfile_guestId_key" ON "BridalPartyProfile"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "HairMakeupSignup_guestId_key" ON "HairMakeupSignup"("guestId");

-- CreateIndex
CREATE INDEX "TimelineEvent_subEvent_sortOrder_idx" ON "TimelineEvent"("subEvent", "sortOrder");

-- CreateIndex
CREATE INDEX "PackingItem_listId_idx" ON "PackingItem"("listId");

-- AddForeignKey
ALTER TABLE "EntityTag" ADD CONSTRAINT "EntityTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "ChecklistMilestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_parentItemId_fkey" FOREIGN KEY ("parentItemId") REFERENCES "ChecklistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "SeatingTable"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BridalPartyProfile" ADD CONSTRAINT "BridalPartyProfile_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HairMakeupSignup" ADD CONSTRAINT "HairMakeupSignup_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingItem" ADD CONSTRAINT "PackingItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "PackingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
