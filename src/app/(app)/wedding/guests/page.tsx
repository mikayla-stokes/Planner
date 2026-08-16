import { getGuests, getSeatingTables } from "./queries";
import { GuestTable } from "./guest-table";
import { AddGuestButton } from "./guest-form-sheet";

export default async function GuestsPage() {
  const [guests, tables] = await Promise.all([getGuests(), getSeatingTables()]);
  const needsReview = guests.filter((g) => g.needsReview).length;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground text-sm">
            {guests.length} guests
            {needsReview > 0 ? ` · ${needsReview} flagged for review` : ""}
          </p>
        </div>
        <AddGuestButton tables={tables} />
      </div>
      <GuestTable guests={guests} tables={tables} />
    </div>
  );
}
