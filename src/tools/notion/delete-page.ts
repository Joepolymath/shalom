import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  pageId: z.string().describe("Notion page ID to archive"),
});

export const notionDeletePageTool: Tool<typeof params> = {
  name: "notion_delete_page",
  description: "Archive (soft-delete) a Notion page.",
  parameters: params,
  async execute({ pageId }) {
    await notion.pages.update({
      page_id: pageId.replace(/-/g, ""),
      archived: true,
    });
    return `Archived page ${pageId}`;
  },
};
