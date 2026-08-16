"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

export function NavPills({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // A section-root item (e.g. "/wedding") is a path prefix of every one of its
  // own subpages, so more than one item can match at once — pick the longest
  // (most specific) match rather than lighting up all of them together.
  const matches = items.filter(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)),
  );
  const bestMatch = matches.reduce<NavItem | null>(
    (best, item) => (!best || item.href.length > best.href.length ? item : best),
    null,
  );

  return (
    <nav className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
      {items.map((item) => {
        const active = item === bestMatch;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
