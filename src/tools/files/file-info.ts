import { z } from "zod";
import { stat } from "node:fs/promises";
import type { Tool } from "../../types.js";

const params = z.object({
  path: z.string().describe("Absolute or relative path to the file or directory"),
});

export const fileInfoTool: Tool<typeof params> = {
  name: "file_info",
  description: "Get file/directory metadata: size, created, modified, permissions.",
  parameters: params,
  async execute({ path }) {
    const s = await stat(path);
    const lines = [
      `Size: ${s.size} bytes`,
      `Directory: ${s.isDirectory()}`,
      `Modified: ${s.mtime.toISOString()}`,
      `Created: ${s.birthtime.toISOString()}`,
      `Mode: ${s.mode.toString(8)}`,
    ];
    return lines.join("\n");
  },
};
