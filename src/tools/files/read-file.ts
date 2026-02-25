import { z } from "zod";
import { readFile } from "node:fs/promises";
import type { Tool } from "../../types.js";

const params = z.object({
  path: z.string().describe("Absolute or relative path to the file"),
  startLine: z.number().optional().describe("Start line (1-based, inclusive)"),
  endLine: z.number().optional().describe("End line (1-based, inclusive)"),
});

export const readFileTool: Tool<typeof params> = {
  name: "read_file",
  description: "Read the contents of a file. Optionally specify a line range.",
  parameters: params,
  async execute({ path, startLine, endLine }) {
    const content = await readFile(path, "utf-8");
    if (startLine === undefined && endLine === undefined) {
      return content;
    }
    const lines = content.split("\n");
    const start = startLine !== undefined ? Math.max(0, startLine - 1) : 0;
    const end =
      endLine !== undefined
        ? Math.min(lines.length, endLine)
        : lines.length;
    return lines.slice(start, end).join("\n");
  },
};
