"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type NavItem = { href: string; label: string };

export function NavPills({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();

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
    <>
      {/* Desktop: full pill row — the header is wide enough above the md
          breakpoint that this shouldn't need to wrap. */}
      <nav className="hidden flex-wrap gap-1.5 md:flex">
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

      {/* Mobile: a dropdown instead of a pill row that would otherwise wrap
          onto multiple lines or need horizontal scrolling to reach items. */}
      <Select
        value={bestMatch?.href ?? ""}
        onValueChange={(href) => href && router.push(href)}
      >
        <SelectTrigger size="sm" className="w-full md:hidden" aria-label="Navigate to section">
          <SelectValue>{() => bestMatch?.label ?? "Menu"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.href} value={item.href}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
