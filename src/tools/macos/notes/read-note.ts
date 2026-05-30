import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  title: z.string().describe("The exact (or first-matching) note title to read."),
  folder: z.string().optional().describe("Restrict the search to this folder."),
});

const script = `
function run(argv) {
  const title = argv[0];
  const folderName = argv[1] || "";
  const app = Application("Notes");
  const notes = folderName
    ? app.folders.byName(folderName).notes()
    : app.notes();
  for (const n of notes) {
    if (n.name() === title) {
      return n.plaintext();
    }
  }
  return "__NOT_FOUND__";
}
`;

export const notesReadTool: Tool<typeof params> = {
  name: "notes_read",
  description: "Read the plain-text body of a note by its title.",
  parameters: params,
  async execute({ title, folder }) {
    const out = await runJXA(script, [title, folder ?? ""]);
    return out === "__NOT_FOUND__"
      ? `No note titled "${title}" found.`
      : out || "(empty note)";
  },
};
