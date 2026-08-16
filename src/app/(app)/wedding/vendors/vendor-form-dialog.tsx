"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { createVendor, updateVendor, deleteVendor, type VendorInput } from "./actions";
import type { Vendor } from "@/generated/prisma/client";

function emptyForm(): VendorInput {
  return {
    name: "",
    vendorType: "",
    officialChoice: false,
    favorite: false,
    website: "",
    events: [],
    pricing: "",
    address: "",
    email: "",
    phone: "",
    contacted: false,
    appointmentScheduled: false,
    packageDetails: "",
    notes: "",
  };
}

function vendorToForm(v: Vendor): VendorInput {
  return {
    name: v.name,
    vendorType: v.vendorType,
    officialChoice: v.officialChoice,
    favorite: v.favorite,
    website: v.website ?? "",
    events: v.events,
    pricing: v.pricing ?? "",
    address: v.address ?? "",
    email: v.email ?? "",
    phone: v.phone ?? "",
    contacted: v.contacted,
    appointmentScheduled: v.appointmentScheduled,
    packageDetails: v.packageDetails ?? "",
    notes: v.notes ?? "",
  };
}

function VendorFields({ form, setForm }: { form: VendorInput; setForm: (f: VendorInput) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="v-name">Name</Label>
          <Input id="v-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-type">Type</Label>
          <Input
            id="v-type"
            value={form.vendorType}
            onChange={(e) => setForm({ ...form, vendorType: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-events">Events (comma-separated)</Label>
        <Input
          id="v-events"
          value={form.events.join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              events: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
            })
          }
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.officialChoice}
            onCheckedChange={(v) => setForm({ ...form, officialChoice: v === true })}
          />
          Booked
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.favorite} onCheckedChange={(v) => setForm({ ...form, favorite: v === true })} />
          Favorite
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.contacted}
            onCheckedChange={(v) => setForm({ ...form, contacted: v === true })}
          />
          Contacted
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.appointmentScheduled}
            onCheckedChange={(v) => setForm({ ...form, appointmentScheduled: v === true })}
          />
          Appointment scheduled
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="v-phone">Phone</Label>
          <Input id="v-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="v-email">Email</Label>
          <Input id="v-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-website">Website</Label>
        <Input id="v-website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-address">Address</Label>
        <Input id="v-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-pricing">Pricing</Label>
        <Input id="v-pricing" value={form.pricing} onChange={(e) => setForm({ ...form, pricing: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-package">Package details</Label>
        <Textarea
          id="v-package"
          value={form.packageDetails}
          onChange={(e) => setForm({ ...form, packageDetails: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-notes">Notes</Label>
        <Textarea id="v-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddVendorButton() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VendorInput>(emptyForm());
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForm(emptyForm());
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add Vendor
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add vendor</DialogTitle>
        </DialogHeader>
        <VendorFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await createVendor(form);
                setOpen(false);
                setForm(emptyForm());
              });
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditVendorButton({ vendor }: { vendor: Vendor }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VendorInput>(() => vendorToForm(vendor));
  const [pending, startTransition] = useTransition();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setForm(vendorToForm(vendor));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7"
            aria-label={`Edit ${vendor.name}`}
          />
        }
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit vendor</DialogTitle>
        </DialogHeader>
        <VendorFields form={form} setForm={setForm} />
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={vendor.name}
            size="sm"
            onConfirm={async () => {
              await deleteVendor(vendor.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={!form.name.trim() || pending}
            onClick={() => {
              startTransition(async () => {
                await updateVendor(vendor.id, form);
                setOpen(false);
              });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
