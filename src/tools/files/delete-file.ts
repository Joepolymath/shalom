import { z } from "zod";
import { rm } from "node:fs/promises";
import type { Tool } from "../../types.js";

const params = z.object({
  path: z.string().describe("Absolute or relative path to the file or directory"),
  recursive: z
    .boolean()
    .optional()
    .describe("If true, recursively delete directories; default false"),
});

export const deleteFileTool: Tool<typeof params> = {
  name: "delete_file",
  description: "Delete a file or directory. Use recursive=true for directories.",
  parameters: params,
  async execute({ path, recursive }) {
    await rm(path, { recursive: recursive ?? false, force: true });
    return `Deleted ${path}`;
  },
};
