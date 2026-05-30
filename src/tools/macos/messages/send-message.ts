import { z } from "zod";
import type { Tool } from "../../../types.js";
import { runAppleScript } from "../osascript.js";

const params = z.object({
  to: z
    .string()
    .describe("Recipient phone number, email, or iMessage handle."),
  message: z.string().describe("The message text to send."),
  service: z
    .enum(["iMessage", "SMS"])
    .optional()
    .describe("Service to use. Default: iMessage."),
});

const script = `
on run argv
  set recipientId to item 1 of argv
  set messageText to item 2 of argv
  set serviceType to item 3 of argv
  tell application "Messages"
    if serviceType is "SMS" then
      set targetService to 1st account whose service type = SMS
    else
      set targetService to 1st account whose service type = iMessage
    end if
    set targetBuddy to participant recipientId of targetService
    send messageText to targetBuddy
  end tell
  return "Sent message to " & recipientId
end run
`;

export const messagesSendTool: Tool<typeof params> = {
  name: "messages_send",
  description: "Send an iMessage or SMS to a recipient via the Messages app.",
  parameters: params,
  async execute({ to, message, service }) {
    return runAppleScript(script, [to, message, service ?? "iMessage"]);
  },
};
