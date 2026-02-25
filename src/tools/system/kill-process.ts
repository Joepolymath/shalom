import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Tool } from "../../types.js";

const execFileAsync = promisify(execFile);

const params = z.object({
  pid: z.number().describe("Process ID to kill. Use list_processes first to find CPU-intensive processes to terminate."),
  signal: z.enum(["SIGTERM", "SIGKILL"]).optional().describe("Signal; SIGTERM is default, SIGKILL forces termination"),
});

export const killProcessTool: Tool<typeof params> = {
  name: "kill_process",
  description:
    "Kill a process by PID. Use list_processes to find PIDs of CPU-intensive apps. SIGTERM allows graceful exit; SIGKILL forces immediate termination.",
  parameters: params,
  async execute({ pid, signal = "SIGTERM" }) {
    await execFileAsync("kill", ["-s", signal, String(pid)]);
    return `Sent ${signal} to PID ${pid}`;
  },
};
