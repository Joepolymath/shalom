import { z } from "zod";
import { writeFile } from "node:fs/promises";
import type { Tool } from "../../types.js";

const params = z.object({
  path: z.string().describe("Absolute or relative path to the file"),
  content: z.string().describe("Content to write to the file"),
});

export const writeFileTool: Tool<typeof params> = {
  name: "write_file",
  description: "Write content to a file. Overwrites existing content.",
  parameters: params,
  async execute({ path, content }) {
    await writeFile(path, content, "utf-8");
    return `Wrote ${content.length} characters to ${path}`;
  },
};
