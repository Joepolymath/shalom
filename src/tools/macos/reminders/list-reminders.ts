import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  list: z
    .string()
    .optional()
    .describe("Name of the reminders list. Omit to search across all lists."),
  status: z
    .enum(["incomplete", "completed", "all"])
    .optional()
    .describe("Filter by completion status. Default: incomplete."),
});

const script = `
function run(argv) {
  const listName = argv[0] || "";
  const status = argv[1] || "incomplete";
  const app = Application("Reminders");
  const lists = listName ? [app.lists.byName(listName)] : app.lists();
  const out = [];
  for (const l of lists) {
    let reminders;
    try { reminders = l.reminders(); } catch (e) { continue; }
    for (const r of reminders) {
      const done = r.completed();
      if (status === "incomplete" && done) continue;
      if (status === "completed" && !done) continue;
      const due = r.dueDate();
      const parts = [];
      parts.push(done ? "[x]" : "[ ]");
      parts.push(r.name());
      if (due) parts.push("(due " + due.toLocaleString() + ")");
      parts.push("- " + l.name());
      out.push(parts.join(" "));
    }
  }
  return out.join("\\n");
}
`;

export const remindersListTool: Tool<typeof params> = {
  name: "reminders_list",
  description:
    "List reminders, optionally filtered by list name and completion status.",
  parameters: params,
  async execute({ list, status }) {
    const out = await runJXA(script, [list ?? "", status ?? "incomplete"]);
    return out || "No matching reminders found.";
  },
};
