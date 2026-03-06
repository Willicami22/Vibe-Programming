interface RecommendationListProps {
  recommendations: string[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  if (recommendations.length === 0) return null;
  return (
    <section className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-800">
        Recomendaciones para reducir tu huella
      </h3>
      <ul className="list-inside list-disc space-y-1 text-sm text-amber-900">
        {recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ul>
    </section>
  );
}
