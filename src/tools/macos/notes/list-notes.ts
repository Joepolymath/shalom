import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  folder: z
    .string()
    .optional()
    .describe("Folder name to list notes from. Omit to list across all notes."),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of note titles to return. Default 50."),
});

const script = `
function run(argv) {
  const folderName = argv[0] || "";
  const limit = parseInt(argv[1] || "50", 10);
  const app = Application("Notes");
  const notes = folderName
    ? app.folders.byName(folderName).notes()
    : app.notes();
  const out = [];
  for (const n of notes) {
    out.push(n.name() + "  [modified " + n.modificationDate().toLocaleString() + "]");
    if (out.length >= limit) break;
  }
  return out.join("\\n");
}
`;

export const notesListTool: Tool<typeof params> = {
  name: "notes_list",
  description: "List note titles, optionally within a specific folder.",
  parameters: params,
  async execute({ folder, limit }) {
    const out = await runJXA(script, [
      folder ?? "",
      limit !== undefined ? String(limit) : "50",
    ]);
    return out || "No notes found.";
  },
};
