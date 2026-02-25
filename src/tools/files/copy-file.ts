import { z } from "zod";
import { cp } from "node:fs/promises";
import type { Tool } from "../../types.js";

const params = z.object({
  source: z.string().describe("Source path"),
  destination: z.string().describe("Destination path"),
  recursive: z
    .boolean()
    .optional()
    .describe("If true, copy directories recursively; default true for directories"),
});

export const copyFileTool: Tool<typeof params> = {
  name: "copy_file",
  description: "Copy a file or directory.",
  parameters: params,
  async execute({ source, destination, recursive }) {
    await cp(source, destination, {
      recursive: recursive ?? true,
    });
    return `Copied ${source} to ${destination}`;
  },
};
