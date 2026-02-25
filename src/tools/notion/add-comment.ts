import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z
  .object({
    pageId: z.string().optional().describe("Page ID to comment on"),
    blockId: z.string().optional().describe("Block ID to comment on (alternative to pageId)"),
    text: z.string().describe("Comment text"),
  })
  .refine((d) => d.pageId ?? d.blockId, "Provide either pageId or blockId");

export const notionAddCommentTool: Tool<typeof params> = {
  name: "notion_add_comment",
  description: "Add a comment to a page or block. Provide either pageId or blockId.",
  parameters: params,
  async execute({ pageId, blockId, text }) {
    const parent = pageId
      ? { page_id: pageId.replace(/-/g, "") }
      : { block_id: blockId!.replace(/-/g, "") };
    const res = await notion.comments.create({
      parent,
      rich_text: [{ text: { content: text } }],
    });
    return `Added comment: ${res.id}`;
  },
};
