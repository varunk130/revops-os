import type { Lead, Partner, ScoreWeights, SubSegment } from "./dataset-types";
import type { ScoredPartner, ScoredSegment, PartnerTier } from "./types";

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const norm = (x: number, max: number) => clamp(x / max, 0, 1);
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

// ---- lead-score: weighted, observable features → 0..100 (predictive of winning) ----
export function scoreLead(lead: Lead, w: ScoreWeights): number {
  const usage = avg([
    norm(lead.signals.monthlyTxns, 1600),
    norm(lead.signals.integrations, 6),
    norm(lead.signals.activeUsers, 42),
    norm(lead.signals.connectedAccounts, 9),
  ]);
  const raw = w.firmographic * lead.firmographicFit + w.usage * usage + w.engagement * lead.signals.engagement + w.intent * lead.intent;
  return Math.round(clamp(raw, 0, 1) * 100);
}

// Probability of winning given score + furthest stage (used by the forecaster).
const STAGE_FACTOR: Record<string, number> = { lead: 0.45, mql: 0.7, pql: 1.0, sql: 1.32, won: 1, lost: 0 };
export function winProbability(score: number, stage: string): number {
  const base = 1 / (1 + Math.exp(-(score - 50) / 14));
  return clamp(base * (STAGE_FACTOR[stage] ?? 1), 0.02, 0.95);
}

// ---- partner fit model ----
export const PARTNER_WEIGHTS = { audienceOverlap: 0.3, complementarity: 0.25, integrationEase: 0.15, momentum: 0.15, brand: 0.15 };

export function scorePartner(p: Partner): number {
  const a = p.attrs;
  const raw =
    PARTNER_WEIGHTS.audienceOverlap * a.audienceOverlap +
    PARTNER_WEIGHTS.complementarity * a.complementarity +
    PARTNER_WEIGHTS.integrationEase * a.integrationEase +
    PARTNER_WEIGHTS.momentum * a.momentum +
    PARTNER_WEIGHTS.brand * a.brand;
  return Math.round(raw * 100);
}

function partnerRationale(p: Partner): string {
  const a = p.attrs;
  const labels: [string, number][] = [
    ["audience overlap", a.audienceOverlap],
    ["product complementarity", a.complementarity],
    ["easy integration", a.integrationEase],
    ["strong momentum", a.momentum],
    ["brand strength", a.brand],
  ];
  const top = labels.sort((x, y) => y[1] - x[1]).slice(0, 2).map((t) => t[0]);
  return `${p.category} with ${top[0]} and ${top[1]}.`;
}

export function rankPartners(partners: Partner[]): ScoredPartner[] {
  return partners
    .map((p) => ({ ...p, fitScore: scorePartner(p), rationale: partnerRationale(p) }))
    .sort((a, b) => b.fitScore - a.fitScore)
    .map((p, i) => {
      const tier: PartnerTier = i < 8 ? "A" : i < 20 ? "B" : "C";
      return { ...p, rank: i + 1, tier };
    });
}

// ---- segment prioritization ----
export function scoreSegment(seg: SubSegment, maxMarket: number): number {
  return Math.round(100 * (0.4 * norm(seg.marketSize, maxMarket) + 0.35 * seg.fit + 0.25 * seg.accessibility));
}

export function rankSegments(segments: SubSegment[], leads: Lead[]): ScoredSegment[] {
  const maxMarket = Math.max(...segments.map((s) => s.marketSize));
  return segments
    .map((s) => {
      const segLeads = leads.filter((l) => l.subSegment === s.key);
      return {
        ...s,
        score: scoreSegment(s, maxMarket),
        leadCount: segLeads.length,
        wonCount: segLeads.filter((l) => l.outcome === "won").length,
        rank: 0,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}
