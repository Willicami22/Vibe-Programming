import OpenAI from "openai";
import type { ExtractedActivity } from "./types";

const SYSTEM_PROMPT = `Eres un asistente que extrae actividades con impacto de carbono a partir de descripciones en lenguaje natural.
Devuelves ÚNICAMENTE un JSON válido (sin markdown, sin texto adicional) con esta estructura exacta:
{
  "activities": [
    {
      "category": "transporte" | "alimentación" | "energía" | "otros",
      "description": "breve descripción de la actividad",
      "quantity": número,
      "unit": "km" | "porción" | "comida" | "kWh" | "viaje" según corresponda,
      "subtype": "opcional: coche, bus, tren, avión, carne, vegetariano, etc."
    }
  ]
}

Reglas:
- Para transporte: quantity = distancia en km (o millas si el usuario lo dice), unit = "km" (o "millas"), subtype = tipo de vehículo (coche, bus, tren, avión, etc.).
- Para alimentación: quantity = número de comidas/porciones, unit = "porción" o "comida", subtype = carne, vegetariano, vegano, etc. si se puede inferir.
- Para energía: quantity = cantidad, unit = "kWh".
- Si no hay actividades con impacto de carbono, devuelve { "activities": [] }.
- category y subtype en minúsculas, en español cuando sea posible.`;

export async function extractActivitiesFromText(
  userText: string
): Promise<ExtractedActivity[]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey === "sk-..." || apiKey.length < 20) {
    throw new Error("OPENAI_API_KEY_NO_CONFIGURADA");
  }

  const openai = new OpenAI({ apiKey });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI no devolvió contenido");
  }

  // Limpiar posible markdown (```json ... ```)
  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  const parsed = JSON.parse(jsonStr) as { activities?: ExtractedActivity[] };
  const activities = Array.isArray(parsed.activities) ? parsed.activities : [];
  return activities
    .filter(
      (a) =>
        a &&
        typeof a.category === "string" &&
        typeof a.quantity === "number" &&
        typeof a.unit === "string"
    )
    .map((a) => ({
      category: a.category,
      description: typeof a.description === "string" ? a.description : a.category,
      quantity: a.quantity,
      unit: a.unit,
      subtype: typeof a.subtype === "string" ? a.subtype : undefined,
    }));
}
