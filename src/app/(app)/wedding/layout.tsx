import { NavPills } from "@/components/nav";

const WEDDING_NAV = [
  { href: "/wedding", label: "Overview" },
  { href: "/wedding/checklist", label: "Checklist" },
  { href: "/wedding/guests", label: "Guests" },
  { href: "/wedding/seating", label: "Seating" },
  { href: "/wedding/vendors", label: "Vendors" },
  { href: "/wedding/budget", label: "Budget" },
  { href: "/wedding/timeline", label: "Timeline" },
  { href: "/wedding/packing", label: "Packing" },
  { href: "/wedding/documents", label: "Documents" },
];

export default function WeddingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <NavPills items={WEDDING_NAV} />
      {children}
    </div>
  );
}
