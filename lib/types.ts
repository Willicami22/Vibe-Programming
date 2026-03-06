/**
 * Actividad extraída por OpenAI del texto del usuario.
 * quantity y unit deben permitir aplicar factores de emisión.
 */
export interface ExtractedActivity {
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  subtype?: string;
}

/**
 * Actividad con CO₂ calculado (para respuesta API y UI).
 */
export interface ActivityWithEmissions extends ExtractedActivity {
  co2Kg: number;
}

export interface EmissionsResult {
  total: number;
  breakdown: ActivityWithEmissions[];
}
