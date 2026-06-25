import type { ScenarioContent } from "@/agents/types";
import type { Accent } from "@/agents/types";
import type { ScenarioId } from "@/lib/types";
import { SCENARIO_CONTENT } from "@content/index";

// Client-safe scenario registry for the demo UI. Holds only labels + the (lightweight) content
// bundle; the heavy per-scenario snapshot is built server-side and passed into the app.
export interface ScenarioMeta {
  id: ScenarioId;
  label: string; // selector label
  company: string;
  vertical: string;
  tagline: string;
  accent: Accent;
  content: ScenarioContent;
}

export const SCENARIOS: ScenarioMeta[] = [
  {
    id: "consumer",
    label: "Consumer brands",
    company: "Northwind",
    vertical: "Consumer brands / DTC",
    tagline: "Fintech entering DTC — product-led, partner-amplified.",
    accent: "gtm",
    content: SCENARIO_CONTENT.consumer,
  },
  {
    id: "enterprise",
    label: "Enterprise · Financial Services",
    company: "Contoso",
    vertical: "Financial Services (enterprise)",
    tagline: "AI platform entering FinServ — enterprise field + partner co-sell.",
    accent: "revops",
    content: SCENARIO_CONTENT.enterprise,
  },
];

export function getScenario(id: ScenarioId): ScenarioMeta {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
