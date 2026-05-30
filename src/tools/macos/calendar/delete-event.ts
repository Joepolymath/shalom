import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  title: z.string().describe("The exact summary/title of the event to delete."),
  start: z
    .string()
    .optional()
    .describe("Range start as ISO 8601 to scope the search. Defaults to now."),
  end: z
    .string()
    .optional()
    .describe("Range end as ISO 8601 to scope the search. Defaults to 30 days out."),
  calendar: z.string().optional().describe("Restrict to a single calendar."),
});

const script = `
function run(argv) {
  const title = argv[0];
  const startIso = argv[1] || "";
  const endIso = argv[2] || "";
  const calName = argv[3] || "";
  const app = Application("Calendar");
  const start = startIso ? new Date(startIso) : new Date();
  const end = endIso ? new Date(endIso) : new Date(start.getTime() + 30 * 86400000);
  const calendars = calName ? [app.calendars.byName(calName)] : app.calendars();
  let count = 0;
  for (const c of calendars) {
    let events;
    try {
      events = c.events.whose({
        _and: [{ startDate: { _greaterThan: start } }, { startDate: { _lessThan: end } }],
      })();
    } catch (e) { continue; }
    for (const ev of events) {
      if (ev.summary() === title) {
        app.delete(ev);
        count++;
      }
    }
  }
  return count > 0
    ? "Deleted " + count + " event(s) titled \\"" + title + "\\"."
    : "No event titled \\"" + title + "\\" found in that range.";
}
`;

export const calendarDeleteEventTool: Tool<typeof params> = {
  name: "calendar_delete_event",
  description:
    "Delete calendar event(s) by title within an optional date range and calendar.",
  parameters: params,
  async execute({ title, start, end, calendar }) {
    return runJXA(script, [title, start ?? "", end ?? "", calendar ?? ""]);
  },
};
