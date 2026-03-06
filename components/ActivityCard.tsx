import type { ActivityWithEmissions } from "@/lib/types";

interface ActivityCardProps {
  activity: ActivityWithEmissions;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { description, quantity, unit, category, co2Kg } = activity;
  const displayDescription = description || category;
  return (
    <article className="rounded-lg border border-stone-200 bg-stone-50/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-stone-800">{displayDescription}</p>
          <p className="mt-0.5 text-sm text-stone-500">
            {category}
            {quantity > 0 && (
              <span className="ml-1">
                · {quantity} {unit}
              </span>
            )}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-800">
          {co2Kg} kg CO₂
        </span>
      </div>
    </article>
  );
}
