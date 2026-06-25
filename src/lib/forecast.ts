import type { Lead, Stage } from "./dataset-types";
import type { ForecastPoint, ForecastResult, FunnelModel, FunnelStageRow, LeadScoredCompact } from "./types";
import { winProbability } from "./scoring";

const STAGE_ORDER: Stage[] = ["lead", "mql", "pql", "sql", "won"];
const STAGE_LABEL: Record<Stage, string> = { lead: "Lead", mql: "MQL", pql: "PQL", sql: "SQL", won: "Won" };
const STAGE_VELOCITY: Record<Stage, number> = { lead: 0, mql: 9, pql: 16, sql: 23, won: 19 };

const idx = (st: Stage) => STAGE_ORDER.indexOf(st);

export function buildFunnelModel(leads: Lead[], stageLabels?: Partial<Record<Stage, string>>): FunnelModel {
  const reachedCount = (st: Stage) => leads.filter((l) => idx(l.stage) >= idx(st)).length;
  const stages: FunnelStageRow[] = STAGE_ORDER.map((st, i) => {
    const reached = reachedCount(st);
    const prev = i === 0 ? reached : reachedCount(STAGE_ORDER[i - 1]);
    return { stage: st, label: stageLabels?.[st] ?? STAGE_LABEL[st], reached, convFromPrev: i === 0 ? 1 : reached / Math.max(1, prev), velocityDays: STAGE_VELOCITY[st] };
  });
  const won = reachedCount("won");
  const avgAcv = Math.round(leads.filter((l) => l.outcome === "won").reduce((s, l) => s + l.acv, 0) / Math.max(1, won));
  return {
    stages,
    wonRate: won / leads.length,
    avgAcv,
    openCount: leads.filter((l) => l.outcome === "open").length,
    lostCount: leads.filter((l) => l.outcome === "lost").length,
  };
}

// 6-month cumulative close curve (deals further along close sooner).
const CUM = [0.1, 0.27, 0.47, 0.67, 0.85, 1.0];

// forecast: expected bookings from open leads scoring >= threshold, with a variance-based band.
export function forecast(leads: LeadScoredCompact[], threshold: number): ForecastResult {
  const pqlCount = leads.filter((l) => l.score >= threshold).length;
  const open = leads.filter((l) => l.outcome === "open" && l.score >= threshold);

  let expected = 0;
  let variance = 0;
  let pipelineValue = 0;
  for (const l of open) {
    const p = winProbability(l.score, l.stage);
    expected += p * l.acv;
    variance += p * (1 - p) * l.acv * l.acv;
    pipelineValue += l.acv;
  }
  const sd = Math.sqrt(variance);

  const closed = leads.filter((l) => l.score >= threshold && (l.outcome === "won" || l.outcome === "lost"));
  const wonClosed = closed.filter((l) => l.outcome === "won").length;
  const winRate = closed.length > 0 ? wonClosed / closed.length : 0;

  const series: ForecastPoint[] = CUM.map((c, i) => ({
    month: i + 1,
    expected: Math.round(expected * c),
    low: Math.round(Math.max(0, expected - sd) * c),
    high: Math.round((expected + sd) * c),
  }));

  return {
    threshold,
    pqlCount,
    pipelineCount: open.length,
    pipelineValue: Math.round(pipelineValue),
    expectedBookings: Math.round(expected),
    low: Math.round(Math.max(0, expected - sd)),
    high: Math.round(expected + sd),
    winRateAtThreshold: winRate,
    series,
  };
}
