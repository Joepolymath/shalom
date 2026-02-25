import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  pageId: z.string().describe("Notion page ID"),
});

function extractTitle(props: unknown): string {
  if (!props || typeof props !== "object") return "(untitled)";
  const p = props as Record<string, unknown>;
  const title = p.title;
  if (Array.isArray(title) && title[0] && typeof title[0] === "object") {
    const t = title[0] as { plain_text?: string };
    return t.plain_text ?? "(untitled)";
  }
  return "(untitled)";
}

export const notionReadPageTool: Tool<typeof params> = {
  name: "notion_read_page",
  description: "Retrieve a Notion page and its basic properties.",
  parameters: params,
  async execute({ pageId }) {
    const res = await notion.pages.retrieve({ page_id: pageId.replace(/-/g, "") });
    const page = res as { id: string; created_time?: string; last_edited_time?: string; properties?: unknown };
    const title = extractTitle(page.properties);
    return `ID: ${page.id}\nTitle: ${title}\nCreated: ${page.created_time ?? "—"}\nLast edited: ${page.last_edited_time ?? "—"}`;
  },
};
