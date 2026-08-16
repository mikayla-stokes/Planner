"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { createGuest, updateGuest, deleteGuest, clearNeedsReview, type GuestInput } from "./actions";
import type { GuestHost, GuestType, RsvpExpectation, RsvpStatus } from "@/generated/prisma/enums";
import type { getGuests, getSeatingTables } from "./queries";

type Guest = Awaited<ReturnType<typeof getGuests>>[number];
type Table = Awaited<ReturnType<typeof getSeatingTables>>[number];

const HOSTS: GuestHost[] = ["BRIDE", "GROOM", "BOTH"];
const TYPES: GuestType[] = ["FAMILY", "FRIENDS", "PLUS_ONE", "COLLEAGUES"];
const RSVP_STATUSES: RsvpStatus[] = ["PENDING", "YES", "NO"];
const RSVP_EXPECTATIONS: (RsvpExpectation | "NONE")[] = ["NONE", "YES", "NO", "UNSURE"];

// Base UI's <Select.Value> shows the raw value unless told how to format it
// (it can't infer a label from SelectItem children until the popup has been
// opened at least once), so every Select below passes one of these explicitly.
const hostLabel = (h: GuestHost) => h[0] + h.slice(1).toLowerCase();
const typeLabel = (t: GuestType) =>
  t
    .split("_")
    .map((w) => w[0] + w.slice(1).toLowerCase())
    .join(" ");
const rsvpStatusLabel = (s: RsvpStatus) => (s === "PENDING" ? "Pending" : s);
const expectedRsvpLabel = (e: RsvpExpectation | "NONE") =>
  e === "NONE" ? "—" : e[0] + e.slice(1).toLowerCase();

function emptyForm(): GuestInput {
  return {
    firstName: "",
    lastName: "",
    tableId: null,
    host: "BOTH",
    type: "FRIENDS",
    role: "",
    events: [],
    saveTheDateSent: false,
    inviteSent: false,
    isKid: false,
    expectedRsvp: null,
    rsvpStatus: "PENDING",
    phone: "",
    email: "",
    addressedTo: "",
    address: "",
    cityZip: "",
    arrivalDate: "",
    dietaryPreferences: "",
    notes: "",
  };
}

function guestToForm(g: Guest): GuestInput {
  return {
    firstName: g.firstName,
    lastName: g.lastName,
    tableId: g.tableId,
    host: g.host,
    type: g.type,
    role: g.role ?? "",
    events: g.events,
    saveTheDateSent: g.saveTheDateSent,
    inviteSent: g.inviteSent,
    isKid: g.isKid,
    expectedRsvp: g.expectedRsvp,
    rsvpStatus: g.rsvpStatus,
    phone: g.phone ?? "",
    email: g.email ?? "",
    addressedTo: g.addressedTo ?? "",
    address: g.address ?? "",
    cityZip: g.cityZip ?? "",
    arrivalDate: g.arrivalDate ?? "",
    dietaryPreferences: g.dietaryPreferences ?? "",
    notes: g.notes ?? "",
  };
}

function GuestFields({
  form,
  setForm,
  tables,
}: {
  form: GuestInput;
  setForm: (f: GuestInput) => void;
  tables: Table[];
}) {
  const eventsText = form.events.join(", ");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>Host</Label>
          <Select value={form.host} onValueChange={(v) => setForm({ ...form, host: v as GuestHost })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: GuestHost) => hostLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {HOSTS.map((h) => (
                <SelectItem key={h} value={h}>
                  {hostLabel(h)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as GuestType })}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: GuestType) => typeLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {typeLabel(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Table</Label>
        <Select
          value={form.tableId ?? "UNASSIGNED"}
          onValueChange={(v) => setForm({ ...form, tableId: v === "UNASSIGNED" ? null : v })}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(v: string) => (v === "UNASSIGNED" ? "Unassigned" : (tables.find((t) => t.id === v)?.name ?? v))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
            {tables.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role">Role (e.g. Usher, Maid of Honor)</Label>
        <Input id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="events">Events (comma-separated)</Label>
        <Input
          id="events"
          value={eventsText}
          onChange={(e) =>
            setForm({
              ...form,
              events: e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
            })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>RSVP</Label>
          <Select
            value={form.rsvpStatus}
            onValueChange={(v) => setForm({ ...form, rsvpStatus: v as RsvpStatus })}
          >
            <SelectTrigger className="w-full">
              <SelectValue>{(v: RsvpStatus) => rsvpStatusLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RSVP_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {rsvpStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Expected RSVP</Label>
          <Select
            value={form.expectedRsvp ?? "NONE"}
            onValueChange={(v) =>
              setForm({ ...form, expectedRsvp: v === "NONE" ? null : (v as RsvpExpectation) })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue>{(v: RsvpExpectation | "NONE") => expectedRsvpLabel(v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RSVP_EXPECTATIONS.map((e) => (
                <SelectItem key={e} value={e}>
                  {expectedRsvpLabel(e)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.saveTheDateSent}
            onCheckedChange={(v) => setForm({ ...form, saveTheDateSent: v === true })}
          />
          Save the date sent
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={form.inviteSent}
            onCheckedChange={(v) => setForm({ ...form, inviteSent: v === true })}
          />
          Invite sent
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.isKid} onCheckedChange={(v) => setForm({ ...form, isKid: v === true })} />
          Kid
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addressedTo">Addressed to</Label>
        <Input
          id="addressedTo"
          value={form.addressedTo}
          onChange={(e) => setForm({ ...form, addressedTo: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cityZip">City / Zip</Label>
          <Input
            id="cityZip"
            value={form.cityZip}
            onChange={(e) => setForm({ ...form, cityZip: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="arrivalDate">Arrival date (if out of town)</Label>
        <Input
          id="arrivalDate"
          value={form.arrivalDate}
          onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dietary">Dietary preferences</Label>
        <Input
          id="dietary"
          value={form.dietaryPreferences}
          onChange={(e) => setForm({ ...form, dietaryPreferences: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </div>
  );
}

export function AddGuestButton({ tables }: { tables: Table[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GuestInput>(emptyForm());
  const [pending, startTransition] = useTransition();

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setForm(emptyForm());
      }}
    >
      <SheetTrigger render={<Button type="button" size="sm" className="gap-1" />}>
        <Plus className="size-3.5" /> Add Guest
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add guest</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <GuestFields form={form} setForm={setForm} tables={tables} />
        </div>
        <SheetFooter>
          <Button
            type="button"
            disabled={!form.firstName.trim() && !form.lastName.trim() ? true : pending}
            onClick={() => {
              startTransition(async () => {
                await createGuest(form);
                setOpen(false);
                setForm(emptyForm());
              });
            }}
          >
            Add Guest
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function EditGuestButton({ guest, tables }: { guest: Guest; tables: Table[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<GuestInput>(() => guestToForm(guest));
  const [pending, startTransition] = useTransition();
  const [stillNeedsReview, setStillNeedsReview] = useState(guest.needsReview);
  const [, startReviewTransition] = useTransition();

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setForm(guestToForm(guest));
          setStillNeedsReview(guest.needsReview);
        }
      }}
    >
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7"
            aria-label={`Edit ${guest.firstName} ${guest.lastName}`}
          />
        }
      >
        <Pencil className="size-4" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            Edit {guest.firstName} {guest.lastName}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto px-4">
          {stillNeedsReview && (
            <div className="bg-accent space-y-2 rounded-md p-3 text-xs">
              <p className="font-medium">Flagged for review</p>
              {guest.reviewNote && <p className="italic">Was: {guest.reviewNote}</p>}
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={false}
                  onCheckedChange={(v) => {
                    if (v !== true) return;
                    setStillNeedsReview(false);
                    startReviewTransition(async () => {
                      try {
                        await clearNeedsReview(guest.id);
                      } catch {
                        setStillNeedsReview(true); // save failed — don't leave the UI showing an unsaved state
                      }
                    });
                  }}
                />
                Mark as reviewed
              </label>
            </div>
          )}
          <GuestFields form={form} setForm={setForm} tables={tables} />
        </div>
        <SheetFooter className="flex-row justify-between sm:justify-between">
          <ConfirmDeleteButton
            itemLabel={`${guest.firstName} ${guest.lastName}`}
            size="sm"
            onConfirm={async () => {
              await deleteGuest(guest.id);
              setOpen(false);
            }}
          />
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await updateGuest(guest.id, form);
                setOpen(false);
              });
            }}
          >
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
