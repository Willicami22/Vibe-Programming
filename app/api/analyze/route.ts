import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { extractActivitiesFromText } from "@/lib/openai";
import { calculateEmissions } from "@/lib/emissions";
import { getRecommendations } from "@/lib/recommendations";
import { prisma } from "@/lib/db";

const MAX_TEXT_LENGTH = 2000;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const dateStr = typeof body.date === "string" ? body.date.trim() : null;

    if (!text || text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Texto requerido (máximo " + MAX_TEXT_LENGTH + " caracteres)." },
        { status: 400 }
      );
    }

    const date = dateStr && DATE_REGEX.test(dateStr)
      ? dateStr
      : new Date().toISOString().slice(0, 10);

    const sessionId = await getOrCreateSessionId();

    const activities = await extractActivitiesFromText(text);
    const { total, breakdown } = calculateEmissions(activities);
    const recommendations = getRecommendations(breakdown);

    const entry = await prisma.entry.create({
      data: {
        sessionId,
        date,
        rawText: text,
        totalCo2Kg: total,
        activitiesJson: JSON.stringify(breakdown),
      },
    });

    return NextResponse.json({
      totalCo2Kg: total,
      breakdown,
      recommendations,
      entryId: entry.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al analizar";
    let errorMsg = message;
    let status = 500;
    if (message === "OPENAI_API_KEY_NO_CONFIGURADA") {
      errorMsg =
        "Falta la API key de OpenAI. Añade OPENAI_API_KEY en el archivo .env y reinicia el servidor (npm run dev).";
      status = 503;
    } else if (message.includes("401") || message.includes("Incorrect API key")) {
      errorMsg = "API key de OpenAI inválida. Comprueba que sea correcta en .env";
      status = 502;
    } else if (message.includes("429") || message.includes("rate limit")) {
      errorMsg = "Límite de uso de OpenAI alcanzado. Espera unos minutos e inténtalo de nuevo.";
      status = 502;
    } else if (message.includes("API") || message.includes("OpenAI")) {
      errorMsg = "Error al conectar con OpenAI. Comprueba tu API key y conexión.";
      status = 502;
    }
    return NextResponse.json({ error: errorMsg }, { status });
  }
}
