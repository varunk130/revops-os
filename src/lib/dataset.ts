// SERVER-ONLY: imports the full datasets (consumer + enterprise). Never import this from a
// client component; the client receives a compact snapshot per scenario (see snapshot.ts).
import consumerRaw from "../../data/atlas.json";
import enterpriseRaw from "../../data/atlas.enterprise.json";
import type { AtlasData } from "./dataset-types";
import type { ScenarioId } from "./types";

export const DATASETS: Record<ScenarioId, AtlasData> = {
  consumer: consumerRaw as unknown as AtlasData,
  enterprise: enterpriseRaw as unknown as AtlasData,
};

export function getDataset(id: ScenarioId): AtlasData {
  return DATASETS[id];
}

export type {
  AtlasData,
  AtlasMeta,
  Lead,
  Partner,
  SubSegment,
  Stage,
  Outcome,
  SizeBand,
  ScoreWeights,
} from "./dataset-types";
