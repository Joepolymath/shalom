import { z } from "zod";
import { totalmem, freemem, uptime, platform, hostname, loadavg } from "node:os";
import type { Tool } from "../../types.js";

const params = z.object({});

function fmt(bytes: number): string {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export const systemInfoTool: Tool<typeof params> = {
  name: "system_info",
  description: "Get system info: memory, uptime, platform, hostname, load averages.",
  parameters: params,
  async execute() {
    const loads = loadavg();
    const lines = [
      `Platform: ${platform()}`,
      `Hostname: ${hostname()}`,
      `Uptime: ${Math.floor(uptime() / 3600)}h ${Math.floor((uptime() % 3600) / 60)}m`,
      `Memory: ${fmt(freemem())} free / ${fmt(totalmem())} total`,
      `Load average: ${loads[0]?.toFixed(2) ?? 0} (1m), ${loads[1]?.toFixed(2) ?? 0} (5m), ${loads[2]?.toFixed(2) ?? 0} (15m)`,
    ];
    return lines.join("\n");
  },
};
