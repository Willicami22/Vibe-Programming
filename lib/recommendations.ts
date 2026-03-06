import type { ActivityWithEmissions } from "./types";

const CAR_KM_THRESHOLD = 10;
const FLIGHT_THRESHOLD = 1;
const MEAT_PORTIONS_THRESHOLD = 1;

/**
 * Genera recomendaciones para reducir la huella de carbono según el desglose de actividades.
 */
export function getRecommendations(breakdown: ActivityWithEmissions[]): string[] {
  const recommendations: string[] = [];
  const byCategory = breakdown.reduce(
    (acc, a) => {
      const cat = a.category.toLowerCase();
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(a);
      return acc;
    },
    {} as Record<string, ActivityWithEmissions[]>
  );

  // Transporte en coche
  const transport = byCategory["transporte"] || byCategory["transport"] || [];
  const carActivities = transport.filter(
    (a) =>
      (a.subtype || "").toLowerCase().includes("coche") ||
      (a.subtype || "").toLowerCase().includes("car") ||
      (a.subtype || "").toLowerCase().includes("carro") ||
      (a.description || "").toLowerCase().includes("coche")
  );
  const carKm = carActivities.reduce((s, a) => s + (a.quantity || 0), 0);
  if (carKm >= CAR_KM_THRESHOLD) {
    recommendations.push(
      "Considera transporte público o compartir vehículo para trayectos habituales y reducir emisiones."
    );
  }

  // Vuelos
  const flights = transport.filter(
    (a) =>
      (a.subtype || a.description || "").toLowerCase().includes("avión") ||
      (a.subtype || a.description || "").toLowerCase().includes("avion") ||
      (a.subtype || a.description || "").toLowerCase().includes("vuelo") ||
      (a.subtype || a.description || "").toLowerCase().includes("flight")
  );
  if (flights.length >= FLIGHT_THRESHOLD) {
    recommendations.push(
      "Para viajes frecuentes en avión, valora alternativas como tren para distancias medias o compensar emisiones."
    );
  }

  // Carne
  const food = byCategory["alimentación"] || byCategory["alimentacion"] || byCategory["food"] || [];
  const meatActivities = food.filter(
    (a) =>
      (a.subtype || a.description || "").toLowerCase().includes("carne") ||
      (a.subtype || a.description || "").toLowerCase().includes("meat") ||
      (a.subtype || a.description || "").toLowerCase().includes("res") ||
      (a.subtype || a.description || "").toLowerCase().includes("cerdo")
  );
  const meatPortions = meatActivities.reduce((s, a) => s + (a.quantity || 1), 0);
  if (meatPortions >= MEAT_PORTIONS_THRESHOLD) {
    recommendations.push(
      "Introducir un día sin carne a la semana reduce notablemente tu huella de carbono."
    );
  }

  // Genérica si hay alto total
  const total = breakdown.reduce((s, a) => s + a.co2Kg, 0);
  if (total > 15 && recommendations.length === 0) {
    recommendations.push(
      "Tu huella de hoy es elevada. Revisa transporte, alimentación y consumo energético para identificar mejoras."
    );
  }

  return recommendations.slice(0, 3);
}
