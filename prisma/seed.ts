import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

import { buildGuests } from "./seed/guests";
import { buildBudgetItems, buildExpenses } from "./seed/budget";
import { buildVendors } from "./seed/vendors";
import { buildBridalPartyProfiles } from "./seed/bridal-party";
import { parseChecklistMarkdown } from "./seed/checklists";
import {
  WEDDING,
  VENUE,
  WEDDING_PARTY,
  TIMELINE_EVENTS,
  PACKING_LISTS,
  MESSAGE_TEMPLATES,
  HAIR_MAKEUP_SIGNUPS,
} from "./seed/static-data";

// Seeding runs the direct (non-pooled) connection — same URL the CLI uses for
// migrations — since it's a one-time script doing hundreds of sequential writes.
const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const db = new PrismaClient({ adapter });

function nameKey(firstName: string, lastName: string) {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}`;
}

async function main() {
  console.log("Clearing existing data...");
  await db.$transaction([
    db.entityTag.deleteMany(),
    db.hairMakeupSignup.deleteMany(),
    db.bridalPartyProfile.deleteMany(),
    db.guest.deleteMany(),
    db.seatingTable.deleteMany(),
    db.checklistItem.deleteMany(),
    db.checklistMilestone.deleteMany(),
    db.vendor.deleteMany(),
    db.weddingBudgetItem.deleteMany(),
    db.weddingExpense.deleteMany(),
    db.timelineEvent.deleteMany(),
    db.packingItem.deleteMany(),
    db.packingList.deleteMany(),
    db.guestMessageTemplate.deleteMany(),
    db.wedding.deleteMany(),
    db.venue.deleteMany(),
    db.tag.deleteMany(),
    db.profile.deleteMany(),
  ]);

  console.log("Seeding profiles, wedding, venue...");
  await db.profile.createMany({ data: [{ name: "Mikayla" }, { name: "Caleb" }] });
  await db.wedding.create({ data: WEDDING });
  await db.venue.create({ data: VENUE });

  console.log("Seeding guests + seating tables...");
  const { guests, tableNames } = buildGuests();
  const tableIdByName = new Map<string, string>();
  for (const name of tableNames) {
    const table = await db.seatingTable.create({ data: { name } });
    tableIdByName.set(name, table.id);
  }

  const guestIdByName = new Map<string, string>();
  for (const guest of guests) {
    const { tableName, ...data } = guest;
    const created = await db.guest.create({
      data: {
        ...data,
        tableId: tableName ? tableIdByName.get(tableName) : undefined,
      },
    });
    guestIdByName.set(nameKey(guest.firstName, guest.lastName), created.id);
  }

  console.log("Overlaying wedding-party roles...");
  for (const member of WEDDING_PARTY) {
    const guestId = guestIdByName.get(nameKey(member.firstName, member.lastName));
    if (!guestId) {
      console.warn(`  (no guest match for wedding-party member ${member.firstName} ${member.lastName})`);
      continue;
    }
    await db.guest.update({
      where: { id: guestId },
      data: { isWeddingParty: true, weddingPartyRole: member.role, weddingSide: member.side },
    });
  }

  console.log("Seeding bridal party profiles...");
  for (const profile of buildBridalPartyProfiles()) {
    const guestId = guestIdByName.get(nameKey(profile.firstName, profile.lastName));
    if (!guestId) {
      console.warn(`  (no guest match for bridal party profile ${profile.firstName} ${profile.lastName})`);
      continue;
    }
    await db.bridalPartyProfile.create({
      data: {
        guestId,
        phone: profile.phone,
        mailingAddress: profile.mailingAddress,
        favoriteSnack: profile.favoriteSnack,
        favoriteColor: profile.favoriteColor,
        favoriteFoods: profile.favoriteFoods,
        favoriteDrinks: profile.favoriteDrinks,
        thingsYouEnjoy: profile.thingsYouEnjoy,
        shirtSize: profile.shirtSize,
        pantSize: profile.pantSize,
        dressSize: profile.dressSize,
        shoeSize: profile.shoeSize,
        allergies: profile.allergies,
        dietaryRestrictions: profile.dietaryRestrictions,
        notes: profile.notes,
      },
    });
  }

  console.log("Seeding hair/makeup signups...");
  for (const signup of HAIR_MAKEUP_SIGNUPS) {
    const match = guests.find(
      (g) => g.firstName.toLowerCase() === signup.firstName.toLowerCase(),
    );
    const guestId = match && guestIdByName.get(nameKey(match.firstName, match.lastName));
    if (!guestId) {
      console.warn(`  (no guest match for hair/makeup signup ${signup.firstName})`);
      continue;
    }
    await db.hairMakeupSignup.create({
      data: { guestId, wantsHair: signup.wantsHair, wantsMakeup: signup.wantsMakeup },
    });
  }

  console.log("Seeding checklist...");
  // The merged file's "Caleb's To-Do List" section is word-for-word the same
  // 3 tasks as Caleb's own file's "Priority / Early (No Fixed Month)" section —
  // drop the merged file's copy so the shared checklist doesn't show it twice.
  const mikaylaMilestones = parseChecklistMarkdown("merged-wedding-checklist.md", "SHARED").filter(
    (m) => m.label !== "Caleb's To-Do List",
  );
  const calebMilestones = parseChecklistMarkdown("calebs-wedding-checklist.md", "CALEB", {
    "Needs a Decision: Whose Task Is This?": "UNDECIDED",
  });

  const milestoneIdByLabel = new Map<string, string>();
  let sortOrder = 0;

  async function ensureMilestone(m: { label: string; monthsOut?: number; fixedDate?: Date }) {
    const existing = milestoneIdByLabel.get(m.label);
    if (existing) return existing;
    const created = await db.checklistMilestone.create({
      data: {
        label: m.label,
        monthsOut: m.monthsOut,
        fixedDate: m.fixedDate,
        sortOrder: sortOrder++,
      },
    });
    milestoneIdByLabel.set(m.label, created.id);
    return created.id;
  }

  // Some tasks are independently listed in both source files under
  // differently-named buckets that map to the same milestone (e.g. the merged
  // file's "Caleb's To-Do List" duplicates Caleb's own file's "Priority / Early"
  // section verbatim) — dedupe by normalized title within a milestone so the
  // same task doesn't show up twice.
  const seenTitlesByMilestone = new Map<string, Set<string>>();

  for (const milestone of [...mikaylaMilestones, ...calebMilestones]) {
    const milestoneId = await ensureMilestone(milestone);
    const seenTitles = seenTitlesByMilestone.get(milestoneId) ?? new Set<string>();
    seenTitlesByMilestone.set(milestoneId, seenTitles);

    for (const item of milestone.items) {
      const normalizedTitle = item.title.trim().toLowerCase();
      if (seenTitles.has(normalizedTitle)) continue;
      seenTitles.add(normalizedTitle);

      const created = await db.checklistItem.create({
        data: {
          milestoneId,
          owner: item.owner,
          title: item.title,
          notes: item.notes,
        },
      });
      for (const sub of item.subItems) {
        await db.checklistItem.create({
          data: {
            milestoneId,
            owner: sub.owner,
            title: sub.title,
            notes: sub.notes,
            parentItemId: created.id,
          },
        });
      }
    }
  }

  console.log("Seeding vendors...");
  await db.vendor.createMany({ data: buildVendors() });

  console.log("Seeding budget + spending...");
  await db.weddingBudgetItem.createMany({ data: buildBudgetItems() });
  await db.weddingExpense.createMany({ data: buildExpenses() });

  console.log("Seeding timeline...");
  await db.timelineEvent.createMany({
    data: TIMELINE_EVENTS.map((event, index) => ({ ...event, sortOrder: index })),
  });

  console.log("Seeding packing lists...");
  for (const list of PACKING_LISTS) {
    await db.packingList.create({
      data: {
        type: list.type,
        name: list.name,
        items: { create: list.items },
      },
    });
  }

  console.log("Seeding guest message templates...");
  await db.guestMessageTemplate.createMany({ data: MESSAGE_TEMPLATES });

  const guestCount = await db.guest.count();
  const needsReviewCount = await db.guest.count({ where: { needsReview: true } });
  console.log(`\nDone. Seeded ${guestCount} guests (${needsReviewCount} flagged for review).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
