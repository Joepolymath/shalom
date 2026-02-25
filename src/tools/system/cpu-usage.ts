import { z } from "zod";
import { cpus, loadavg } from "node:os";
import type { Tool } from "../../types.js";

const params = z.object({});

export const cpuUsageTool: Tool<typeof params> = {
  name: "cpu_usage",
  description:
    "Get CPU usage snapshot: cores, load averages. Use to assess system load.",
  parameters: params,
  async execute() {
    const cores = cpus();
    const loads = loadavg();
    const lines = [
      `Cores: ${cores.length}`,
      `Load average (1m, 5m, 15m): ${loads[0]?.toFixed(2) ?? 0}, ${loads[1]?.toFixed(2) ?? 0}, ${loads[2]?.toFixed(2) ?? 0}`,
      "",
      "Per-core (model, speed MHz):",
      ...cores.map((c, i) => `  ${i}: ${c.model} @ ${c.speed} MHz`),
    ];
    return lines.join("\n");
  },
};
