import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({});

const script = `
function run() {
  const app = Application("Calendar");
  return app.calendars().map(c => c.name()).join("\\n");
}
`;

export const calendarListCalendarsTool: Tool<typeof params> = {
  name: "calendar_list_calendars",
  description: "List the names of all calendars in the Calendar app.",
  parameters: params,
  async execute() {
    const out = await runJXA(script);
    return out || "No calendars found.";
  },
};
