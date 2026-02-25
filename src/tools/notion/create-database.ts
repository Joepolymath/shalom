import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  parentPageId: z.string().describe("Parent page ID to create database under"),
  title: z.string().describe("Database title"),
});

export const notionCreateDatabaseTool: Tool<typeof params> = {
  name: "notion_create_database",
  description: "Create a new Notion database under a page.",
  parameters: params,
  async execute({ parentPageId, title }) {
    const res = await notion.databases.create({
      parent: { type: "page_id", page_id: parentPageId.replace(/-/g, "") },
      title: [{ text: { content: title } }],
    });
    return `Created database: ${res.id}`;
  },
};
