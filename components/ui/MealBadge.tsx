type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

const styles: Record<MealType, string> = {
  BREAKFAST: 'bg-amber-100 text-amber-800',
  LUNCH: 'bg-green-100 text-green-800',
  DINNER: 'bg-indigo-100 text-indigo-800',
};

const labels: Record<MealType, string> = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
};

export function MealBadge({ type }: { type: MealType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}
