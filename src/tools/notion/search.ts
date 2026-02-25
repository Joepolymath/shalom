import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  query: z.string().optional().describe("Search query string"),
  pageSize: z.number().optional().describe("Number of results; default 20"),
});

export const notionSearchTool: Tool<typeof params> = {
  name: "notion_search",
  description: "Search Notion for pages and databases.",
  parameters: params,
  async execute({ query, pageSize = 20 }) {
    const res = await notion.search(
      query !== undefined && query !== "" ? { query, page_size: pageSize } : { page_size: pageSize }
    );
    const lines = res.results.map((r) => {
      const obj = r as { id?: string; object?: string; title?: unknown };
      const id = obj.id ?? "";
      const title =
        obj.object === "page"
          ? (obj as { properties?: Record<string, { title?: { plain_text?: string }[] }> }).properties?.title
              ?.title?.[0]?.plain_text ?? "(untitled)"
          : (obj as { title?: { plain_text?: string }[] }).title?.[0]?.plain_text ?? "(untitled)";
      return `${id} | ${title}`;
    });
    return lines.length > 0 ? lines.join("\n") : "(no results)";
  },
};
