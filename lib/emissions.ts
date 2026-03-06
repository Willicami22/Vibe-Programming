/**
 * Factores de emisión (kg CO₂ por unidad).
 * Fuentes aproximadas: DEFRA (UK), EPA (US), IPCC.
 * Valores orientativos para estimación de huella de carbono.
 */

import type { ExtractedActivity, ActivityWithEmissions, EmissionsResult } from "./types";

// Transporte (kg CO₂ por km por persona, aproximado)
const TRANSPORT_FACTORS: Record<string, number> = {
  car: 0.21,        // coche promedio
  carro: 0.21,
  coche: 0.21,
  bus: 0.089,
  autobús: 0.089,
  autobus: 0.089,
  train: 0.041,
  tren: 0.041,
  metro: 0.041,
  subway: 0.041,
  bike: 0,
  bicicleta: 0,
  walk: 0,
  caminar: 0,
  flight_short: 0.255,   // < 1500 km
  flight_medium: 0.195,  // 1500–4000 km
  flight_long: 0.195,    // > 4000 km
  avión: 0.255,
  avion: 0.255,
  vuelo: 0.255,
  plane: 0.255,
  motorcycle: 0.113,
  moto: 0.113,
  taxi: 0.21,
  uber: 0.21,
};

// Alimentación (kg CO₂ por porción/comida típica)
const FOOD_FACTORS: Record<string, number> = {
  meat: 2.5,        // carne por porción
  carne: 2.5,
  beef: 3.0,
  res: 3.0,
  pork: 1.8,
  cerdo: 1.8,
  chicken: 0.9,
  pollo: 0.9,
  vegetarian: 0.5,
  vegetariano: 0.5,
  vegano: 0.3,
  vegan: 0.3,
  fish: 0.8,
  pescado: 0.8,
  dairy: 0.4,
  lacteos: 0.4,
  meal: 1.0,         // comida genérica
  comida: 1.0,
};

// Energía (kg CO₂ por kWh, mix eléctrico promedio)
const KWH_FACTOR = 0.4;

// Unidades que esperamos en "unit" para transporte (por km)
const TRANSPORT_UNITS = ["km", "kilometers", "kilómetros", "millas", "miles"];
// Para vuelos a veces se da en km de distancia
const FLIGHT_KEYWORDS = ["vuelo", "flight", "avión", "avion", "plane", "fly", "volé", "volar"];

function normalizeCategory(cat: string): string {
  return cat.toLowerCase().trim();
}

function normalizeSubtype(sub: string | undefined): string {
  if (!sub) return "";
  return sub.toLowerCase().trim();
}

/**
 * Obtiene el factor de emisión (kg CO₂ por unidad) para una actividad.
 */
export function getEmissionFactor(
  category: string,
  unit: string,
  subtype?: string
): number {
  const cat = normalizeCategory(category);
  const sub = normalizeSubtype(subtype);
  const u = unit.toLowerCase().trim();

  // Transporte: unit suele ser "km"
  if (
    cat.includes("transport") ||
    cat.includes("transporte") ||
    cat.includes("travel") ||
    cat.includes("viaje") ||
    cat.includes("travel") ||
    TRANSPORT_UNITS.includes(u)
  ) {
    const desc = (sub || cat).split(/\s+/).join(" ");
    if (FLIGHT_KEYWORDS.some((k) => desc.includes(k)))
      return TRANSPORT_FACTORS["flight_short"] ?? 0.25;
    if (desc.includes("bus") || desc.includes("autobús") || desc.includes("autobus"))
      return TRANSPORT_FACTORS["bus"] ?? 0.09;
    if (desc.includes("tren") || desc.includes("train") || desc.includes("metro"))
      return TRANSPORT_FACTORS["train"] ?? 0.04;
    if (desc.includes("coche") || desc.includes("car") || desc.includes("carro") || desc.includes("taxi") || desc.includes("uber"))
      return TRANSPORT_FACTORS["car"] ?? 0.21;
    if (desc.includes("moto") || desc.includes("motorcycle"))
      return TRANSPORT_FACTORS["motorcycle"] ?? 0.11;
    return TRANSPORT_FACTORS["car"] ?? 0.21;
  }

  // Alimentación: por "portion" o "meal"
  if (
    cat.includes("food") ||
    cat.includes("alimentación") ||
    cat.includes("alimentacion") ||
    cat.includes("meal") ||
    cat.includes("comida") ||
    cat.includes("eating") ||
    cat.includes("comí") ||
    cat.includes("comi")
  ) {
    const key = sub || cat;
    for (const [k, v] of Object.entries(FOOD_FACTORS)) {
      if (key.includes(k)) return v;
    }
    return FOOD_FACTORS["meal"] ?? 1.0;
  }

  // Energía: kWh
  if (
    cat.includes("energy") ||
    cat.includes("energía") ||
    cat.includes("energia") ||
    cat.includes("electric") ||
    u === "kwh" ||
    u === "kw"
  ) {
    return KWH_FACTOR;
  }

  return 0;
}

const MILES_TO_KM = 1.60934;

function toStandardQuantity(quantity: number, unit: string, category: string): number {
  const u = unit.toLowerCase().trim();
  const cat = category.toLowerCase();
  const isTransport =
    cat.includes("transport") ||
    cat.includes("transporte") ||
    cat.includes("travel") ||
    cat.includes("viaje");
  if (isTransport && (u === "millas" || u === "miles" || u === "mi"))
    return quantity * MILES_TO_KM;
  return quantity;
}

/**
 * Calcula emisiones para una lista de actividades extraídas por OpenAI.
 */
export function calculateEmissions(activities: ExtractedActivity[]): EmissionsResult {
  const breakdown: ActivityWithEmissions[] = activities.map((a) => {
    const factor = getEmissionFactor(a.category, a.unit, a.subtype);
    const qty = toStandardQuantity(a.quantity, a.unit, a.category);
    const co2Kg = Math.round((qty * factor) * 100) / 100;
    return { ...a, co2Kg };
  });
  const total = Math.round(breakdown.reduce((sum, b) => sum + b.co2Kg, 0) * 100) / 100;
  return { total, breakdown };
}
