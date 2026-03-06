import { describe, it, expect } from "vitest";
import { getEmissionFactor, calculateEmissions } from "./emissions";
import type { ExtractedActivity } from "./types";

describe("getEmissionFactor", () => {
  it("devuelve factor para transporte en coche", () => {
    const f = getEmissionFactor("transporte", "km", "coche");
    expect(f).toBe(0.21);
  });

  it("devuelve factor para bus", () => {
    const f = getEmissionFactor("transporte", "km", "bus");
    expect(f).toBe(0.089);
  });

  it("devuelve factor para alimentación carne", () => {
    const f = getEmissionFactor("alimentación", "porción", "carne");
    expect(f).toBe(2.5);
  });

  it("devuelve factor para vegetariano", () => {
    const f = getEmissionFactor("alimentación", "comida", "vegetariano");
    expect(f).toBe(0.5);
  });

  it("devuelve 0.4 para energía kWh", () => {
    const f = getEmissionFactor("energía", "kWh");
    expect(f).toBe(0.4);
  });
});

describe("calculateEmissions", () => {
  it("calcula total y desglose para actividades de transporte", () => {
    const activities: ExtractedActivity[] = [
      { category: "transporte", description: "bus", quantity: 20, unit: "km", subtype: "bus" },
      { category: "transporte", description: "coche", quantity: 10, unit: "km", subtype: "coche" },
    ];
    const result = calculateEmissions(activities);
    expect(result.breakdown).toHaveLength(2);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.breakdown[0].co2Kg).toBe(Math.round(20 * 0.089 * 100) / 100);
    expect(result.breakdown[1].co2Kg).toBe(Math.round(10 * 0.21 * 100) / 100);
  });

  it("devuelve total 0 para lista vacía", () => {
    const result = calculateEmissions([]);
    expect(result.total).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });
});
