"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { GuestHost, GuestType, RsvpExpectation, RsvpStatus } from "@/generated/prisma/enums";

export type GuestInput = {
  firstName: string;
  lastName: string;
  tableId?: string | null;
  host: GuestHost;
  type: GuestType;
  role?: string;
  events: string[];
  saveTheDateSent: boolean;
  inviteSent: boolean;
  isKid: boolean;
  expectedRsvp?: RsvpExpectation | null;
  rsvpStatus: RsvpStatus;
  phone?: string;
  email?: string;
  addressedTo?: string;
  address?: string;
  cityZip?: string;
  arrivalDate?: string;
  dietaryPreferences?: string;
  notes?: string;
};

function clean(input: GuestInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    tableId: input.tableId || null,
    host: input.host,
    type: input.type,
    role: input.role || null,
    events: input.events,
    saveTheDateSent: input.saveTheDateSent,
    inviteSent: input.inviteSent,
    isKid: input.isKid,
    expectedRsvp: input.expectedRsvp || null,
    rsvpStatus: input.rsvpStatus,
    phone: input.phone || null,
    email: input.email || null,
    addressedTo: input.addressedTo || null,
    address: input.address || null,
    cityZip: input.cityZip || null,
    arrivalDate: input.arrivalDate || null,
    dietaryPreferences: input.dietaryPreferences || null,
    notes: input.notes || null,
  };
}

function revalidateGuestPages() {
  revalidatePath("/wedding/guests");
  revalidatePath("/wedding/seating");
  revalidatePath("/wedding");
}

export async function createGuest(input: GuestInput) {
  await db.guest.create({ data: clean(input) });
  revalidateGuestPages();
}

export async function updateGuest(id: string, input: GuestInput) {
  await db.guest.update({ where: { id }, data: clean(input) });
  revalidateGuestPages();
}

export async function deleteGuest(id: string) {
  await db.guest.delete({ where: { id } });
  revalidateGuestPages();
}

export async function clearNeedsReview(id: string) {
  await db.guest.update({ where: { id }, data: { needsReview: false } });
  revalidateGuestPages();
}

export async function moveGuestTable(id: string, tableId: string | null) {
  await db.guest.update({ where: { id }, data: { tableId } });
  revalidateGuestPages();
}
