import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({});

const script = `
function run() {
  const app = Application("Notes");
  return app.folders().map(f => f.name()).join("\\n");
}
`;

export const notesListFoldersTool: Tool<typeof params> = {
  name: "notes_list_folders",
  description: "List the names of all folders in the Notes app.",
  parameters: params,
  async execute() {
    const out = await runJXA(script);
    return out || "No note folders found.";
  },
};
