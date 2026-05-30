import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  start: z
    .string()
    .optional()
    .describe("Range start as ISO 8601. Defaults to now."),
  end: z
    .string()
    .optional()
    .describe("Range end as ISO 8601. Defaults to 7 days from start."),
  calendar: z
    .string()
    .optional()
    .describe("Restrict to a single calendar by name."),
});

const script = `
function run(argv) {
  const startIso = argv[0] || "";
  const endIso = argv[1] || "";
  const calName = argv[2] || "";
  const app = Application("Calendar");
  const start = startIso ? new Date(startIso) : new Date();
  const end = endIso ? new Date(endIso) : new Date(start.getTime() + 7 * 86400000);
  const calendars = calName ? [app.calendars.byName(calName)] : app.calendars();
  const out = [];
  for (const c of calendars) {
    let events;
    try {
      events = c.events.whose({
        _and: [{ startDate: { _greaterThan: start } }, { startDate: { _lessThan: end } }],
      })();
    } catch (e) { continue; }
    for (const ev of events) {
      out.push(
        ev.startDate().toLocaleString() + " - " + ev.endDate().toLocaleString() +
        "  " + ev.summary() + "  [" + c.name() + "]"
      );
    }
  }
  out.sort();
  return out.join("\\n");
}
`;

export const calendarListEventsTool: Tool<typeof params> = {
  name: "calendar_list_events",
  description:
    "List calendar events within a date range (defaults to the next 7 days).",
  parameters: params,
  async execute({ start, end, calendar }) {
    const out = await runJXA(script, [start ?? "", end ?? "", calendar ?? ""]);
    return out || "No events found in that range.";
  },
};
