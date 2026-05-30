import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runJXA } from "../osascript.js";

const params = z.object({});

const script = `
function run() {
  const app = Application("Reminders");
  return app.lists().map(l => l.name()).join("\\n");
}
`;

export const remindersListListsTool: Tool<typeof params> = {
  name: "reminders_list_lists",
  description: "List the names of all Reminders lists.",
  parameters: params,
  async execute() {
    const out = await runJXA(script);
    return out || "No reminder lists found.";
  },
};
