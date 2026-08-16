import { NavPills } from "@/components/nav";

const GROCERIES_NAV = [
  { href: "/groceries", label: "Grocery List" },
  { href: "/groceries/pantry", label: "Pantry" },
  { href: "/groceries/recipes", label: "Recipes" },
  { href: "/groceries/meal-plan", label: "Meal Plan" },
];

export default function GroceriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <NavPills items={GROCERIES_NAV} />
      {children}
    </div>
  );
}
