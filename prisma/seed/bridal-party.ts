import { loadWorkbook, sheetToRows, optionalStr, str } from "./xlsx-utils";

export type SeedBridalPartyProfile = {
  firstName: string;
  lastName: string;
  phone?: string;
  mailingAddress?: string;
  favoriteSnack?: string;
  favoriteColor?: string;
  favoriteFoods?: string;
  favoriteDrinks?: string;
  thingsYouEnjoy?: string;
  shirtSize?: string;
  pantSize?: string;
  dressSize?: string;
  shoeSize?: string;
  allergies?: string;
  dietaryRestrictions?: string;
  notes?: string;
};

// The girlies sheet uses nicknames that don't match the guest list's formal names.
const NAME_ALIASES: Record<string, string> = { jessie: "jessica" };

const ALLERGIES_HEADER =
  "Allergies (put severe allergies in all caps so we can avoid them at all costs please. I will have epi-pens but I would really not like to use them)";
const DRESS_SIZE_HEADER = "Dress Size (Kyle this doesn't apply to you)";
const DRINKS_HEADER = "Favorite Drinks (alcoholic and non-alcoholic)";

export function buildBridalPartyProfiles(): SeedBridalPartyProfile[] {
  const wb = loadWorkbook("For the Girlies (and Kyle).xlsx");
  const rows = sheetToRows(wb, "Add Your Info").filter((r) => str(r["First Name"]).length > 0);

  return rows
    .filter((row) => str(row["First Name"]).toLowerCase() !== "mikayla") // bride isn't a guest
    .map((row) => {
      const rawFirstName = str(row["First Name"]);
      const aliased = NAME_ALIASES[rawFirstName.toLowerCase()];
      const firstName = aliased
        ? aliased[0].toUpperCase() + aliased.slice(1)
        : rawFirstName;
      return {
        firstName,
        lastName: str(row["Last Name"]),
        phone: optionalStr(row["Phone Number"]),
        mailingAddress: optionalStr(row["Mailing Address"]),
        favoriteSnack: optionalStr(row["Favorite Snack"]),
        favoriteColor: optionalStr(row["Favorite Color"]),
        favoriteFoods: optionalStr(row["Favorite Foods/Type of Food"]),
        favoriteDrinks: optionalStr(row[DRINKS_HEADER]),
        thingsYouEnjoy: optionalStr(row["Things You Enjoy"]),
        shirtSize: optionalStr(row["Shirt Size"]),
        pantSize: optionalStr(row["Pant Size"]),
        dressSize: optionalStr(row[DRESS_SIZE_HEADER]),
        shoeSize: optionalStr(row["Shoe Size"]),
        allergies: optionalStr(row[ALLERGIES_HEADER]),
        dietaryRestrictions: optionalStr(row["Dietary Restrictions"]),
        notes: optionalStr(row["Anything Else We Should Know?"]),
      };
    });
}
