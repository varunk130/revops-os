import type { Lead, Outcome, PartnerAttrs, SizeBand, Stage } from "./dataset-types";

// ---- scored analytical outputs ----
export interface ScoredSegment {
  key: string;
  label: string;
  blurb: string;
  marketSize: number;
  fit: number;
  accessibility: number;
  avgAcv: number;
  score: number; // 0..100 priority
  rank: number;
  leadCount: number;
  wonCount: number;
}

export type PartnerTier = "A" | "B" | "C";

export interface ScoredPartner {
  id: string;
  name: string;
  category: string;
  reach: number;
  attrs: PartnerAttrs;
  segmentFocus: string;
  fitScore: number; // 0..100
  rank: number;
  tier: PartnerTier;
  rationale: string;
}

export interface FunnelStageRow {
  stage: Stage;
  label: string;
  reached: number;
  convFromPrev: number; // 0..1
  velocityDays: number;
}

export interface FunnelModel {
  stages: FunnelStageRow[];
  wonRate: number;
  avgAcv: number;
  openCount: number;
  lostCount: number;
}

// ---- compact lead representations for the client ----
export interface LeadScoredCompact {
  score: number;
  acv: number;
  stage: Stage;
  outcome: Outcome;
}

export interface LeadLite {
  id: string;
  company: string;
  segLabel: string;
  sizeBand: SizeBand;
  stage: Stage;
  outcome: Outcome;
  acv: number;
  score: number;
}

// ---- forecast ----
export interface ForecastPoint {
  month: number;
  expected: number;
  low: number;
  high: number;
}

export interface ForecastResult {
  threshold: number;
  pqlCount: number;
  pipelineCount: number;
  pipelineValue: number;
  expectedBookings: number;
  low: number;
  high: number;
  winRateAtThreshold: number;
  series: ForecastPoint[];
}

// ---- curated content output types ----
export interface Motion {
  channels: { name: string; rationale: string }[];
  salesMotion: string;
  salesMotionDetail: string;
  pricing: { name: string; price: string; forWho: string }[];
  pricingThesis: string;
}

export interface OutreachEmail {
  step: number;
  trigger: string;
  subject: string;
  body: string;
}

export interface OnePager {
  title: string;
  sections: { heading: string; body: string }[];
}

export interface AttributionRec {
  model: string;
  modelRationale: string;
  stack: { layer: string; tool: string; buildVsBuy: "build" | "buy"; why: string }[];
  summary: string;
}

export type ScoredLead = Lead & { score: number };

export interface ScoreBin {
  bin: number; // bucket lower bound (0,10,...,90)
  count: number;
}

export interface AtlasSnapshot {
  meta: {
    company: string;
    product: string;
    vertical: string;
    leadCount: number;
    partnerCount: number;
    defaultThreshold: number;
    weights: { firmographic: number; usage: number; engagement: number; intent: number };
  };
  segments: ScoredSegment[];
  partners: ScoredPartner[];
  funnel: FunnelModel;
  leadsScored: LeadScoredCompact[];
  leadsTop: LeadLite[];
  scoreHistogram: ScoreBin[];
}

// ---- scenario system ----
export type ScenarioId = "consumer" | "enterprise";

// Per-scenario terminology so shared views/agents read naturally for each motion
// (e.g. consumer "leads / PQL"; enterprise "accounts / propensity").
export interface ScenarioLabels {
  leadNoun: string; // "leads" | "accounts"
  leadNounSingular: string; // "lead" | "account"
  qualifiedShort: string; // table badge: "PQL" | "Qual"
  qualifiedPlural: string; // chips/prose: "PQLs" | "qualified accounts"
  scoreModelNoun: string; // "PQL model" | "propensity model"
  scoreModelTitle: string; // view header: "Lead scoring · PQL model" | "Account scoring · propensity model"
  thresholdLabel: string; // slider label: "PQL score threshold" | "Propensity threshold"
  thresholdNoun: string; // prose: "PQL threshold" | "propensity threshold"
  segmentsTitle: string; // "ICP sub-segments · prioritized" | "Industry segments · prioritized"
  recordsNoun: string; // funnel headline: "CRM records" | "accounts"
  countLabel: string; // orchestrator chip: "CRM leads" | "Accounts"
  stageLabels: Record<Stage, string>; // funnel display labels per scenario
}

// Executive brief artifact — curated narrative fused with the live computed metrics.
export interface ExecBrief {
  to: string;
  subject: string;
  thesis: string;
  recommendation: string;
  metrics: { label: string; value: string; sub?: string }[];
  bets: { title: string; body: string }[];
  risks: { risk: string; mitigation: string }[];
  asks: { label: string; value: string }[];
  timeline: { phase: string; detail: string }[];
}
