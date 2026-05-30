import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({
  title: z.string().describe("The event title/summary."),
  start: z.string().describe("Start time as ISO 8601, e.g. 2026-06-01T09:00:00."),
  end: z
    .string()
    .optional()
    .describe("End time as ISO 8601. Defaults to 1 hour after start."),
  calendar: z
    .string()
    .optional()
    .describe("Calendar name to add to. Defaults to the first calendar."),
  location: z.string().optional().describe("Optional event location."),
  notes: z.string().optional().describe("Optional event notes/description."),
});

const script = `
function run(argv) {
  const title = argv[0];
  const startIso = argv[1];
  const endIso = argv[2] || "";
  const calName = argv[3] || "";
  const location = argv[4] || "";
  const notes = argv[5] || "";
  const app = Application("Calendar");
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date(start.getTime() + 3600000);
  const cal = calName ? app.calendars.byName(calName) : app.calendars()[0];
  const props = { summary: title, startDate: start, endDate: end };
  if (location) props.location = location;
  if (notes) props.description = notes;
  const ev = app.Event(props);
  cal.events.push(ev);
  return "Created event \\"" + title + "\\" on " + start.toLocaleString() + " in " + cal.name();
}
`;

export const calendarCreateEventTool: Tool<typeof params> = {
  name: "calendar_create_event",
  description:
    "Create a calendar event with a title, start/end time, and optional calendar, location, and notes.",
  parameters: params,
  async execute({ title, start, end, calendar, location, notes }) {
    return runJXA(script, [
      title,
      start,
      end ?? "",
      calendar ?? "",
      location ?? "",
      notes ?? "",
    ]);
  },
};
