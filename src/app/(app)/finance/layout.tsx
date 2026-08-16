import { NavPills } from "@/components/nav";

const FINANCE_NAV = [
  { href: "/finance", label: "Budget" },
  { href: "/finance/bills", label: "Bills" },
  { href: "/finance/expenses", label: "Expenses" },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <NavPills items={FINANCE_NAV} />
      {children}
    </div>
  );
}
