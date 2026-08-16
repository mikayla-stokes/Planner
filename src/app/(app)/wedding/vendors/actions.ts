"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type VendorInput = {
  name: string;
  vendorType: string;
  officialChoice: boolean;
  favorite: boolean;
  website?: string;
  events: string[];
  pricing?: string;
  address?: string;
  email?: string;
  phone?: string;
  contacted: boolean;
  appointmentScheduled: boolean;
  packageDetails?: string;
  notes?: string;
};

function clean(input: VendorInput) {
  return {
    name: input.name,
    vendorType: input.vendorType,
    officialChoice: input.officialChoice,
    favorite: input.favorite,
    website: input.website || null,
    events: input.events,
    pricing: input.pricing || null,
    address: input.address || null,
    email: input.email || null,
    phone: input.phone || null,
    contacted: input.contacted,
    appointmentScheduled: input.appointmentScheduled,
    packageDetails: input.packageDetails || null,
    notes: input.notes || null,
  };
}

export async function createVendor(input: VendorInput) {
  await db.vendor.create({ data: clean(input) });
  revalidatePath("/wedding/vendors");
}

export async function updateVendor(id: string, input: VendorInput) {
  await db.vendor.update({ where: { id }, data: clean(input) });
  revalidatePath("/wedding/vendors");
}

export async function deleteVendor(id: string) {
  await db.vendor.delete({ where: { id } });
  revalidatePath("/wedding/vendors");
}
