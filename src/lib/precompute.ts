import { runAtlas } from "@/agents/orchestrator";
import { buildSnapshot } from "./snapshot";
import { SCENARIO_CONTENT } from "@content/index";
import type { AtlasSnapshot, ScenarioId } from "./types";
import type { PlanResult } from "@/agents/types";

// Runs the agent loop headlessly (no trace, instant) to produce the launch plan for the
// static Results page. Same runtime the live demo uses.
export async function precompute(id: ScenarioId = "consumer"): Promise<{ snapshot: AtlasSnapshot; plan: PlanResult }> {
  const snapshot = buildSnapshot(id);
  const content = SCENARIO_CONTENT[id];
  const plan = await runAtlas({
    goal: id === "enterprise" ? "Enter Financial Services (enterprise)" : "Enter the consumer-brands vertical",
    snapshot,
    content,
    emit: () => {},
    wait: async () => {},
  });
  return { snapshot, plan };
}
