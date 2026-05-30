import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  name: z.string().describe("The exact name of the reminder to delete."),
  list: z
    .string()
    .optional()
    .describe("Restrict the deletion to this list name."),
});

const script = `
function run(argv) {
  const name = argv[0];
  const listName = argv[1] || "";
  const app = Application("Reminders");
  const lists = listName ? [app.lists.byName(listName)] : app.lists();
  let count = 0;
  for (const l of lists) {
    let reminders;
    try { reminders = l.reminders(); } catch (e) { continue; }
    for (const r of reminders) {
      if (r.name() === name) {
        app.delete(r);
        count++;
      }
    }
  }
  return count > 0
    ? "Deleted " + count + " reminder(s) named \\"" + name + "\\"."
    : "No reminder named \\"" + name + "\\" found.";
}
`;

export const remindersDeleteTool: Tool<typeof params> = {
  name: "reminders_delete",
  description: "Delete a reminder by name, optionally within a list.",
  parameters: params,
  async execute({ name, list }) {
    return runJXA(script, [name, list ?? ""]);
  },
};
