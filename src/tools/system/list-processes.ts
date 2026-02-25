import { z } from "zod";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { Tool } from "../../types.js";

const execAsync = promisify(exec);

const params = z.object({
  topN: z.number().optional().describe("Number of top processes by CPU; default 15"),
});

export const listProcessesTool: Tool<typeof params> = {
  name: "list_processes",
  description:
    "List processes sorted by CPU usage. Shows top N most CPU-intensive apps/processes.",
  parameters: params,
  async execute({ topN = 15 }) {
    const { stdout } = await execAsync("ps aux", { maxBuffer: 1024 * 1024 });
    const lines = stdout.trim().split("\n");
    const header = lines[0];
    const data = lines.slice(1);
    const sorted = data.sort((a, b) => {
      const cpuA = parseFloat(a.split(/\s+/)[2] ?? "0");
      const cpuB = parseFloat(b.split(/\s+/)[2] ?? "0");
      return cpuB - cpuA;
    });
    return [header, ...sorted.slice(0, topN)].join("\n");
  },
};
