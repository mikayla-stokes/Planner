import { getGuests, getSeatingTables } from "./queries";
import { GuestTable } from "./guest-table";
import { AddGuestButton } from "./guest-form-sheet";
import { ExportButton } from "@/components/export-button";
import { label, yesNo } from "@/lib/export";

export default async function GuestsPage() {
  const [guests, tables] = await Promise.all([getGuests(), getSeatingTables()]);
  const needsReview = guests.filter((g) => g.needsReview).length;
  const yesCount = guests.filter((g) => g.rsvpStatus === "YES").length;
  const noCount = guests.filter((g) => g.rsvpStatus === "NO").length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "PENDING").length;

  const exportSheets = [
    {
      name: "Guests",
      rows: guests.map((g) => ({
        "First Name": g.firstName,
        "Last Name": g.lastName,
        Host: label(g.host),
        Type: label(g.type),
        Role: g.role,
        Table: g.table?.name,
        RSVP: label(g.rsvpStatus),
        "Expected RSVP": label(g.expectedRsvp),
        "Save the Date Sent": yesNo(g.saveTheDateSent),
        "Invite Sent": yesNo(g.inviteSent),
        Kid: yesNo(g.isKid),
        "Wedding Party": yesNo(g.isWeddingParty),
        "Wedding Party Role": g.weddingPartyRole,
        "Wedding Side": g.weddingSide,
        Phone: g.phone,
        Email: g.email,
        "Addressed To": g.addressedTo,
        Address: g.address,
        "City / Zip": g.cityZip,
        "Arrival Date": g.arrivalDate,
        Dietary: g.dietaryPreferences,
        Notes: g.notes,
        "Needs Review": yesNo(g.needsReview),
        "Review Note": g.reviewNote,
      })),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground text-sm">
            {guests.length} guests
            {needsReview > 0 ? ` · ${needsReview} flagged for review` : ""}
          </p>
          <p className="text-muted-foreground text-sm">
            {yesCount} yes · {noCount} no · {pendingCount} pending
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ExportButton filename="wedding-guests" sheets={exportSheets} />
          <AddGuestButton tables={tables} />
        </div>
      </div>
      <GuestTable guests={guests} tables={tables} />
    </div>
  );
}
