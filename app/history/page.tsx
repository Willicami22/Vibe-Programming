"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EmissionChart } from "@/components/EmissionChart";

interface Entry {
  id: string;
  date: string;
  rawText: string;
  totalCo2Kg: number;
  createdAt: string;
}

interface EntriesResponse {
  entries: Entry[];
}

interface StatsResponse {
  totalCo2Kg: number;
  averagePerDay: number;
  byCategory: Record<string, number>;
  entriesCount: number;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const to = new Date();
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);

    Promise.all([
      fetch(`/api/entries?from=${fromStr}&to=${toStr}`).then((r) => r.json()),
      fetch(`/api/stats?from=${fromStr}&to=${toStr}`).then((r) => r.json()),
    ])
      .then(([entriesData, statsData]: [EntriesResponse, StatsResponse]) => {
        setEntries(entriesData.entries || []);
        setStats(statsData);
      })
      .catch(() => {
        setEntries([]);
        setStats(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = entries
    .reduce(
      (acc, e) => {
        const existing = acc.find((x) => x.date === e.date);
        if (existing) existing.co2 += e.totalCo2Kg;
        else acc.push({ date: e.date, co2: e.totalCo2Kg, label: e.date });
        return acc;
      },
      [] as { date: string; co2: number; label: string }[]
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, co2: Math.round(d.co2 * 100) / 100 }));

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="border-b border-stone-200 bg-white/90 py-4">
          <div className="mx-auto max-w-2xl px-4">
            <Link href="/" className="text-sm text-emerald-700 hover:underline">
              ← Inicio
            </Link>
            <h1 className="mt-2 text-xl font-semibold text-stone-800">Historial</h1>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-8">
          <p className="text-stone-500">Cargando…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white/90 py-4">
        <div className="mx-auto max-w-2xl px-4">
          <Link href="/" className="text-sm text-emerald-700 hover:underline">
            ← Inicio
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-stone-800">Historial y tendencias</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {stats && (
          <section className="rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
              Resumen (último mes)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500">Total CO₂</p>
                <p className="text-xl font-bold text-emerald-800">{stats.totalCo2Kg} kg</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Promedio por día</p>
                <p className="text-xl font-bold text-stone-800">{stats.averagePerDay} kg</p>
              </div>
            </div>
            {Object.keys(stats.byCategory).length > 0 && (
              <div className="mt-3 pt-3 border-t border-stone-100">
                <p className="text-xs text-stone-500 mb-1">Por categoría</p>
                <ul className="text-sm text-stone-700 space-y-0.5">
                  {Object.entries(stats.byCategory).map(([cat, value]) => (
                    <li key={cat}>
                      {cat}: <strong>{value} kg</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {chartData.length > 0 && (
          <section className="rounded-xl border border-stone-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
              Emisiones por día
            </h2>
            <EmissionChart data={chartData} />
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
            Entradas
          </h2>
          {entries.length === 0 ? (
            <p className="rounded-lg border border-stone-200 bg-white p-4 text-stone-500">
              Aún no hay registros. Añade actividades en la página principal.
            </p>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-stone-800">{e.date}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-stone-600">{e.rawText}</p>
                    </div>
                    <span className="shrink-0 rounded bg-emerald-100 px-2 py-0.5 text-sm font-semibold text-emerald-800">
                      {e.totalCo2Kg} kg CO₂
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
