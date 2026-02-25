import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  pageId: z.string().describe("Notion page ID"),
  title: z.string().describe("New page title"),
});

export const notionUpdatePageTool: Tool<typeof params> = {
  name: "notion_update_page",
  description: "Update a Notion page's title.",
  parameters: params,
  async execute({ pageId, title }) {
    await notion.pages.update({
      page_id: pageId.replace(/-/g, ""),
      properties: {
        title: {
          title: [{ text: { content: title } }],
        },
      },
    });
    return `Updated page ${pageId}`;
  },
};
