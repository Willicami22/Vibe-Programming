import { NextRequest, NextResponse } from "next/server";
import type { Entry } from "@prisma/client";
import { getSessionId } from "@/lib/session";
import { prisma } from "@/lib/db";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({
      totalCo2Kg: 0,
      averagePerDay: 0,
      byCategory: {},
      entriesCount: 0,
    });
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
    orderBy: { date: "asc" },
  });

  const totalCo2Kg = Math.round(entries.reduce((s: number, e: Entry) => s + e.totalCo2Kg, 0) * 100) / 100;
  const uniqueDays = new Set(entries.map((e: Entry) => e.date)).size;
  const averagePerDay = uniqueDays > 0 ? Math.round((totalCo2Kg / uniqueDays) * 100) / 100 : 0;

  const byCategory: Record<string, number> = {};
  for (const e of entries) {
    try {
      const activities = JSON.parse(e.activitiesJson) as Array<{ category?: string; co2Kg?: number }>;
      for (const a of activities) {
        const cat = (a.category || "otros").toLowerCase();
        byCategory[cat] = (byCategory[cat] || 0) + (a.co2Kg ?? 0);
      }
    } catch {
      // ignore invalid json
    }
  }
  for (const k of Object.keys(byCategory)) {
    byCategory[k] = Math.round(byCategory[k] * 100) / 100;
  }

  return NextResponse.json({
    totalCo2Kg,
    averagePerDay,
    byCategory,
    entriesCount: entries.length,
  });
}
