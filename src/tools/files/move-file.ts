import { z } from "zod";
import { rename } from "node:fs/promises";
import type { Tool } from "../../types.js";

const params = z.object({
  source: z.string().describe("Source path"),
  destination: z.string().describe("Destination path"),
});

export const moveFileTool: Tool<typeof params> = {
  name: "move_file",
  description: "Rename or move a file or directory.",
  parameters: params,
  async execute({ source, destination }) {
    await rename(source, destination);
    return `Moved ${source} to ${destination}`;
  },
};
