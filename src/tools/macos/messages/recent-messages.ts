import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Tool } from "../../../types.js";

const execFileAsync = promisify(execFile);

const params = z.object({
  contact: z
    .string()
    .optional()
    .describe("Filter to messages whose handle contains this text (phone/email)."),
  limit: z
    .number()
    .optional()
    .describe("Maximum number of recent messages to return. Default 20."),
});

const CHAT_DB = join(homedir(), "Library", "Messages", "chat.db");

const FULL_DISK_HINT =
  "Could not read Messages history. Reading chat.db requires Full Disk Access for the app running this process (System Settings > Privacy & Security > Full Disk Access).";

export const messagesRecentTool: Tool<typeof params> = {
  name: "messages_recent",
  description:
    "Read recent messages from the Messages history (requires Full Disk Access).",
  parameters: params,
  async execute({ contact, limit = 20 }) {
    const where = contact
      ? `WHERE h.id LIKE '%${contact.replace(/'/g, "''")}%'`
      : "";
    const query = `
      SELECT
        datetime(m.date/1000000000 + 978307200, 'unixepoch', 'localtime') AS ts,
        CASE m.is_from_me WHEN 1 THEN 'me' ELSE COALESCE(h.id, 'unknown') END AS sender,
        COALESCE(m.text, '') AS body
      FROM message m
      LEFT JOIN handle h ON m.handle_id = h.ROWID
      ${where}
      ORDER BY m.date DESC
      LIMIT ${Math.max(1, Math.min(limit, 200))};
    `;
    try {
      const { stdout } = await execFileAsync(
        "sqlite3",
        ["-readonly", "-separator", "  |  ", CHAT_DB, query],
        { maxBuffer: 8 * 1024 * 1024, timeout: 30_000 }
      );
      const lines = stdout.trim().split("\n").filter(Boolean).reverse();
      return lines.length ? lines.join("\n") : "No matching messages found.";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/authorization|not permitted|unable to open/i.test(message)) {
        throw new Error(`${FULL_DISK_HINT}\n\nDetails: ${message}`);
      }
      throw new Error(message);
    }
  },
};
