import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  pageSize: z.number().optional().describe("Max results; default 20"),
});

export const notionListDatabasesTool: Tool<typeof params> = {
  name: "notion_list_databases",
  description: "List Notion databases (data sources) via search.",
  parameters: params,
  async execute({ pageSize = 20 }) {
    const res = await notion.search({
      filter: { property: "object", value: "data_source" },
      page_size: pageSize,
    });
    const lines = res.results.map((r) => {
      const obj = r as { id?: string; title?: { plain_text?: string }[] };
      const title = obj.title?.[0]?.plain_text ?? "(untitled)";
      return `${obj.id ?? ""} | ${title}`;
    });
    return lines.length > 0 ? lines.join("\n") : "(no results)";
  },
};
