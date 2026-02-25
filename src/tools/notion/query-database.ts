import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  dataSourceId: z.string().describe("Data source (database) ID to query"),
  pageSize: z.number().optional().describe("Max results; default 20"),
});

export const notionQueryDatabaseTool: Tool<typeof params> = {
  name: "notion_query_database",
  description: "Query a Notion database/data source for pages.",
  parameters: params,
  async execute({ dataSourceId, pageSize = 20 }) {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId.replace(/-/g, ""),
      page_size: pageSize,
    });
    const lines = res.results.map((r) => {
      const obj = r as { id?: string; properties?: Record<string, { title?: { plain_text?: string }[] }> };
      const title = obj.properties?.title?.title?.[0]?.plain_text ?? obj.properties?.Name?.title?.[0]?.plain_text ?? "(untitled)";
      return `${obj.id ?? ""} | ${title}`;
    });
    return lines.length > 0 ? lines.join("\n") : "(no results)";
  },
};
