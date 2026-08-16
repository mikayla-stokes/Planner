import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { logout } from "@/app/login/logout-actions";
import { ActingAsProvider } from "@/lib/acting-as";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { NavPills } from "@/components/nav";
import { Button } from "@/components/ui/button";

const PRIMARY_NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/wedding", label: "Wedding" },
  { href: "/todo", label: "To-Do" },
  { href: "/work", label: "Work" },
  { href: "/household", label: "Household" },
  { href: "/groceries", label: "Groceries" },
  { href: "/finance", label: "Finance" },
  { href: "/relationship", label: "Relationship" },
  { href: "/travel", label: "Travel" },
  { href: "/calendar", label: "Calendar" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  return (
    <ActingAsProvider>
      <div className="flex min-h-screen flex-col">
        <header className="bg-background/95 sticky top-0 z-10 border-b backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <span className="text-3xl font-semibold tracking-tight">Our Life Planner</span>
            <div className="flex items-center gap-2">
              <ProfileSwitcher />
              <form action={logout}>
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </div>
          </div>
          <div className="mx-auto max-w-3xl px-4 pb-2">
            <NavPills items={PRIMARY_NAV} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </div>
    </ActingAsProvider>
  );
}
