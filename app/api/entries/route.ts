import { NextRequest, NextResponse } from "next/server";
import type { Entry } from "@prisma/client";
import { getSessionId } from "@/lib/session";
import { prisma } from "@/lib/db";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ entries: [] });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: { sessionId: string; date?: { gte?: string; lte?: string } } = {
    sessionId,
  };
  if (from && DATE_REGEX.test(from)) {
    where.date = { ...where.date, gte: from };
  }
  if (to && DATE_REGEX.test(to)) {
    where.date = { ...where.date, lte: to };
  }

  const entries = await prisma.entry.findMany({
    where,
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json({
    entries: entries.map((e: Entry) => ({
      id: e.id,
      date: e.date,
      rawText: e.rawText,
      totalCo2Kg: e.totalCo2Kg,
      activitiesJson: e.activitiesJson,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
