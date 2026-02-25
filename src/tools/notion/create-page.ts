import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  parentId: z.string().describe("Parent page ID or database ID"),
  parentType: z.enum(["page_id", "database_id"]).describe("Type of parent"),
  title: z.string().describe("Page title"),
});

export const notionCreatePageTool: Tool<typeof params> = {
  name: "notion_create_page",
  description: "Create a new Notion page under a page or database.",
  parameters: params,
  async execute({ parentId, parentType, title }) {
    const parent =
      parentType === "page_id"
        ? { page_id: parentId.replace(/-/g, "") }
        : { database_id: parentId.replace(/-/g, "") };
    const res = await notion.pages.create({
      parent,
      properties: {
        title: {
          title: [{ text: { content: title } }],
        },
      },
    });
    return `Created page: ${res.id}`;
  },
};
