import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  title: z.string().describe("The title of the new note."),
  body: z.string().optional().describe("The body text of the note."),
  folder: z
    .string()
    .optional()
    .describe("Folder name to create the note in. Defaults to the default folder."),
});

const script = `
function run(argv) {
  const title = argv[0];
  const body = argv[1] || "";
  const folderName = argv[2] || "";
  const app = Application("Notes");
  const escaped = (title + "\\n" + body)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\\n/g, "<br>");
  const props = { body: escaped };
  const target = folderName ? app.folders.byName(folderName) : app.defaultFolder();
  const note = app.Note(props);
  target.notes.push(note);
  return "Created note \\"" + title + "\\" in " + target.name();
}
`;

export const notesCreateTool: Tool<typeof params> = {
  name: "notes_create",
  description: "Create a new note with a title, optional body, and folder.",
  parameters: params,
  async execute({ title, body, folder }) {
    return runJXA(script, [title, body ?? "", folder ?? ""]);
  },
};
