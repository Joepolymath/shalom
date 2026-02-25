import { z } from "zod";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Tool } from "../../types.js";

const params = z.object({
  path: z.string().describe("Absolute or relative path to the directory"),
});

export const listDirectoryTool: Tool<typeof params> = {
  name: "list_directory",
  description:
    "List entries in a directory with type indicators (file/directory).",
  parameters: params,
  async execute({ path }) {
    const entries = await readdir(path, { withFileTypes: true });
    const lines = entries.map((e) => `${e.isDirectory() ? "[DIR] " : ""}${e.name}`);
    return lines.length > 0 ? lines.join("\n") : "(empty directory)";
  },
};
