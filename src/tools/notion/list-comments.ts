import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  blockId: z.string().describe("Block ID to list comments for"),
  pageSize: z.number().optional().describe("Max comments; default 20"),
});

export const notionListCommentsTool: Tool<typeof params> = {
  name: "notion_list_comments",
  description: "List comments on a block.",
  parameters: params,
  async execute({ blockId, pageSize = 20 }) {
    const res = await notion.comments.list({
      block_id: blockId.replace(/-/g, ""),
      page_size: pageSize,
    });
    const lines = res.results.map((c) => {
      const obj = c as { rich_text?: Array<{ plain_text?: string }> };
      const text = obj.rich_text?.[0]?.plain_text ?? "(no text)";
      return text;
    });
    return lines.length > 0 ? lines.join("\n") : "(no comments)";
  },
};
