import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  query: z.string().describe("Text to search for in note titles and bodies."),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of matching notes to return. Default 20."),
});

const script = `
function run(argv) {
  const query = (argv[0] || "").toLowerCase();
  const limit = parseInt(argv[1] || "20", 10);
  const app = Application("Notes");
  const out = [];
  for (const n of app.notes()) {
    const name = n.name();
    let body = "";
    try { body = n.plaintext(); } catch (e) {}
    if (name.toLowerCase().includes(query) || body.toLowerCase().includes(query)) {
      const idx = body.toLowerCase().indexOf(query);
      const snippet = idx >= 0
        ? body.substring(Math.max(0, idx - 40), idx + 80).replace(/\\n/g, " ")
        : "";
      out.push(name + (snippet ? "  ...  " + snippet : ""));
      if (out.length >= limit) break;
    }
  }
  return out.join("\\n");
}
`;

export const notesSearchTool: Tool<typeof params> = {
  name: "notes_search",
  description: "Search notes by text in their titles and bodies.",
  parameters: params,
  async execute({ query, limit }) {
    const out = await runJXA(script, [
      query,
      limit !== undefined ? String(limit) : "20",
    ]);
    return out || `No notes matching "${query}" found.`;
  },
};
