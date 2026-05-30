import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  name: z.string().describe("The reminder title."),
  list: z
    .string()
    .optional()
    .describe("Name of the list to add to. Defaults to the default list."),
  dueDate: z
    .string()
    .optional()
    .describe("Due date as an ISO 8601 string, e.g. 2026-06-01T09:00:00."),
  body: z.string().optional().describe("Optional notes/body for the reminder."),
  priority: z
    .number()
    .optional()
    .describe("Priority 0-9 (0 none, 1 high, 5 medium, 9 low)."),
});

const script = `
function run(argv) {
  const name = argv[0];
  const listName = argv[1] || "";
  const dueIso = argv[2] || "";
  const body = argv[3] || "";
  const priority = argv[4] || "";
  const app = Application("Reminders");
  const props = { name: name };
  if (dueIso) props.dueDate = new Date(dueIso);
  if (body) props.body = body;
  if (priority !== "") props.priority = parseInt(priority, 10);
  const reminder = app.Reminder(props);
  const target = listName ? app.lists.byName(listName) : app.defaultList();
  target.reminders.push(reminder);
  return "Created reminder \\"" + name + "\\" in " + target.name();
}
`;

export const remindersCreateTool: Tool<typeof params> = {
  name: "reminders_create",
  description:
    "Create a new reminder with an optional list, due date, notes, and priority.",
  parameters: params,
  async execute({ name, list, dueDate, body, priority }) {
    if (dueDate !== undefined && Number.isNaN(Date.parse(dueDate))) {
      return `Error: "${dueDate}" is not a valid date. Provide an ISO 8601 value like 2026-05-30T15:18:00.`;
    }
    return runJXA(script, [
      name,
      list ?? "",
      dueDate ?? "",
      body ?? "",
      priority !== undefined ? String(priority) : "",
    ]);
  },
};
