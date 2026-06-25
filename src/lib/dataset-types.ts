// Canonical dataset types for Atlas. Company "Northwind" (fintech) entering a new vertical.
// Shared by the seed generator and runtime. No runtime imports.

export type Stage = "lead" | "mql" | "pql" | "sql" | "won";
export type Outcome = "won" | "lost" | "open";
export type SizeBand = "smb" | "mid" | "ent";

export interface LeadSignals {
  monthlyTxns: number; // product-usage signal
  connectedAccounts: number;
  integrations: number;
  activeUsers: number;
  tenureDays: number;
  engagement: number; // 0..1 feature adoption
}

export interface Lead {
  id: string;
  company: string;
  subSegment: string;
  employees: number;
  sizeBand: SizeBand;
  region: string;
  signals: LeadSignals;
  firmographicFit: number; // 0..1 ICP match (observable feature)
  intent: number; // 0..1 buying-intent signal (observable feature)
  stage: Stage; // furthest stage reached
  outcome: Outcome;
  acv: number; // annual contract value (potential or realized)
  ageDays: number; // days since created
}

export interface SubSegment {
  key: string;
  label: string;
  blurb: string;
  marketSize: number; // target companies (TAM proxy)
  fit: number; // 0..1 product fit
  accessibility: number; // 0..1 ease of reaching
  avgAcv: number;
}

export interface PartnerAttrs {
  audienceOverlap: number;
  complementarity: number;
  integrationEase: number;
  momentum: number;
  brand: number;
}

export interface Partner {
  id: string;
  name: string;
  category: string;
  reach: number; // audience size
  attrs: PartnerAttrs;
  segmentFocus: string;
}

export interface ScoreWeights {
  firmographic: number;
  usage: number;
  engagement: number;
  intent: number;
}

export interface AtlasMeta {
  company: string;
  product: string;
  vertical: string;
  generatedAt: string;
  seed: number;
  leadCount: number;
  defaultThreshold: number; // PQL score cutoff (0..100)
  weights: ScoreWeights;
  partnerCount: number;
}

export interface AtlasData {
  meta: AtlasMeta;
  segments: SubSegment[];
  leads: Lead[];
  partners: Partner[];
}
