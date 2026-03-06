"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityCard } from "@/components/ActivityCard";
import { RecommendationList } from "@/components/RecommendationList";
import type { ActivityWithEmissions } from "@/lib/types";

interface AnalyzeResponse {
  totalCo2Kg: number;
  breakdown: ActivityWithEmissions[];
  recommendations: string[];
  entryId: string;
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), date: new Date().toISOString().slice(0, 10) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al analizar");
        return;
      }
      setResult(data);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white/90 py-4">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-xl font-semibold text-stone-800">EcoTrack</h1>
          <p className="text-sm text-stone-500">Registra tu huella de carbono en lenguaje natural</p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="day-text" className="block text-sm font-medium text-stone-700">
            ¿Qué hiciste hoy? Describe tus actividades (transporte, comidas, etc.)
          </label>
          <textarea
            id="day-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej: Hoy comí carne y viajé 20 km en bus. Por la tarde 10 km en coche."
            className="w-full resize-y rounded-lg border border-stone-300 bg-white p-3 text-stone-800 placeholder:text-stone-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={4}
            maxLength={2000}
            disabled={loading}
          />
          <p className="text-xs text-stone-400">{text.length} / 2000</p>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Calculando…" : "Calcular huella"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="text-sm font-medium text-emerald-800">Estimación total del día</p>
              <p className="mt-1 text-3xl font-bold text-emerald-900">
                {result.totalCo2Kg} kg CO₂
              </p>
            </div>
            {result.breakdown.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-600">
                  Desglose por actividad
                </h2>
                <ul className="space-y-3">
                  {result.breakdown.map((a, i) => (
                    <li key={i}>
                      <ActivityCard activity={a} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <RecommendationList recommendations={result.recommendations} />
          </div>
        )}

        <nav className="mt-10 border-t border-stone-200 pt-6">
          <Link
            href="/history"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Ver historial y tendencias →
          </Link>
        </nav>
      </main>
    </div>
  );
}
