// Deliberately simple: case-insensitive substring match in either direction,
// so pantry "large eggs" matches recipe ingredient "eggs" and vice versa. No
// unit normalization or quantity math.
export function isOnHand(ingredientName: string, pantryNames: string[]): boolean {
  const needle = ingredientName.trim().toLowerCase();
  if (!needle) return false;
  return pantryNames.some((p) => {
    const hay = p.trim().toLowerCase();
    return hay.length > 0 && (hay.includes(needle) || needle.includes(hay));
  });
}
