import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  title: z.string().describe("The exact title of the note to delete."),
  folder: z.string().optional().describe("Restrict the deletion to this folder."),
});

const script = `
function run(argv) {
  const title = argv[0];
  const folderName = argv[1] || "";
  const app = Application("Notes");
  const notes = folderName
    ? app.folders.byName(folderName).notes()
    : app.notes();
  let count = 0;
  for (const n of notes) {
    if (n.name() === title) {
      app.delete(n);
      count++;
    }
  }
  return count > 0
    ? "Deleted " + count + " note(s) titled \\"" + title + "\\"."
    : "No note titled \\"" + title + "\\" found.";
}
`;

export const notesDeleteTool: Tool<typeof params> = {
  name: "notes_delete",
  description: "Delete a note by its title, optionally within a folder.",
  parameters: params,
  async execute({ title, folder }) {
    return runJXA(script, [title, folder ?? ""]);
  },
};
