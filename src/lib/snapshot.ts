// SERVER-ONLY: builds a compact, fully-computed snapshot from the full dataset so the
// client never has to load 2,000 raw leads. The heavy analytical work (lead scoring,
// funnel model, partner/segment ranking) runs here via the real skills; the client does
// only light, interactive re-forecasting on the compact `leadsScored` array.
import { getDataset } from "./dataset";
import { rankPartners, rankSegments, scoreLead } from "./scoring";
import { buildFunnelModel } from "./forecast";
import { SCENARIO_CONTENT } from "@content/index";
import type { AtlasSnapshot, LeadLite, LeadScoredCompact, ScenarioId, ScoreBin, ScoredLead } from "./types";

function histogram(values: number[], bins = 10): ScoreBin[] {
  const out: ScoreBin[] = Array.from({ length: bins }, (_, i) => ({ bin: i * (100 / bins), count: 0 }));
  for (const v of values) {
    const i = Math.min(bins - 1, Math.floor(v / (100 / bins)));
    out[i].count++;
  }
  return out;
}

const cache: Partial<Record<ScenarioId, AtlasSnapshot>> = {};

export function buildSnapshot(id: ScenarioId = "consumer"): AtlasSnapshot {
  const hit = cache[id];
  if (hit) return hit;

  const { meta, segments, leads, partners } = getDataset(id);
  const stageLabels = SCENARIO_CONTENT[id].labels.stageLabels;

  const scored: ScoredLead[] = leads.map((l) => ({ ...l, score: scoreLead(l, meta.weights) }));
  const segLabel = (k: string) => segments.find((s) => s.key === k)?.label ?? k;

  const leadsScored: LeadScoredCompact[] = scored.map((l) => ({ score: l.score, acv: l.acv, stage: l.stage, outcome: l.outcome }));
  const leadsTop: LeadLite[] = [...scored]
    .sort((a, b) => b.score - a.score)
    .slice(0, 120)
    .map((l) => ({
      id: l.id,
      company: l.company,
      segLabel: segLabel(l.subSegment),
      sizeBand: l.sizeBand,
      stage: l.stage,
      outcome: l.outcome,
      acv: l.acv,
      score: l.score,
    }));

  const snap: AtlasSnapshot = {
    meta: {
      company: meta.company,
      product: meta.product,
      vertical: meta.vertical,
      leadCount: meta.leadCount,
      partnerCount: meta.partnerCount,
      defaultThreshold: meta.defaultThreshold,
      weights: meta.weights,
    },
    segments: rankSegments(segments, leads),
    partners: rankPartners(partners),
    funnel: buildFunnelModel(leads, stageLabels),
    leadsScored,
    leadsTop,
    scoreHistogram: histogram(scored.map((l) => l.score)),
  };
  cache[id] = snap;
  return snap;
}
