import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Tool } from "../../types.js";

const execFileAsync = promisify(execFile);

const params = z.object({
  path: z.string().describe("Directory to search in"),
  pattern: z.string().describe("Search pattern (regex supported)"),
  maxResults: z.number().optional().describe("Max number of matches to return; default 50"),
});

export const searchContentTool: Tool<typeof params> = {
  name: "search_content",
  description:
    "Recursively search file contents for a pattern. Uses ripgrep (rg) if available, else grep.",
  parameters: params,
  async execute({ path, pattern, maxResults = 50 }) {
    try {
      const { stdout } = await execFileAsync("rg", [
        "--line-number",
        "--no-heading",
        `--max-count=${maxResults}`,
        pattern,
        path,
      ], { maxBuffer: 1024 * 1024 });
      return stdout.trim() || "(no matches)";
    } catch (e: unknown) {
      const err = e as { code?: number };
      if (err?.code === 1) {
        return "(no matches)";
      }
      try {
        const { stdout } = await execFileAsync("grep", [
          "-r",
          "-n",
          "-m",
          String(maxResults),
          "-E",
          pattern,
          path,
        ], { maxBuffer: 1024 * 1024 });
        return stdout.trim() || "(no matches)";
      } catch {
        return `Error: Neither ripgrep nor grep found. ${e instanceof Error ? e.message : String(e)}`;
      }
    }
  },
};
