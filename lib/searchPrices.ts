export function computeSearchPrices(
  pricePerMeal: number | null | undefined,
  pricePerMonth: number | null | undefined,
  operationalDays: string[],
): { searchPricePerMeal: number | null; searchPricePerMonth: number | null } {
  // If neither price is defined, return nulls.
  if (pricePerMeal == null && pricePerMonth == null) {
    return { searchPricePerMeal: null, searchPricePerMonth: null };
  }

  const daysPerWeek = operationalDays && operationalDays.length > 0 ? operationalDays.length : 6;
  const daysPerMonth = Math.round(daysPerWeek * 4.33);

  let searchPricePerMeal = pricePerMeal != null ? pricePerMeal : null;
  let searchPricePerMonth = pricePerMonth != null ? pricePerMonth : null;

  if (pricePerMeal != null && pricePerMonth == null) {
    searchPricePerMonth = Math.round(pricePerMeal * daysPerMonth);
  } else if (pricePerMonth != null && pricePerMeal == null) {
    searchPricePerMeal = Math.round(pricePerMonth / daysPerMonth);
  }

  return {
    searchPricePerMeal,
    searchPricePerMonth,
  };
}
