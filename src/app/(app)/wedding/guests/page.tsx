import { getGuests, getSeatingTables } from "./queries";
import { GuestTable } from "./guest-table";
import { AddGuestButton } from "./guest-form-sheet";

export default async function GuestsPage() {
  const [guests, tables] = await Promise.all([getGuests(), getSeatingTables()]);
  const needsReview = guests.filter((g) => g.needsReview).length;
  const yesCount = guests.filter((g) => g.rsvpStatus === "YES").length;
  const noCount = guests.filter((g) => g.rsvpStatus === "NO").length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "PENDING").length;

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
        <AddGuestButton tables={tables} />
      </div>
      <GuestTable guests={guests} tables={tables} />
    </div>
  );
}
