import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  blockId: z.string().describe("Block ID to update"),
  blockType: z.enum(["paragraph", "heading_1", "heading_2"]).describe("Block type"),
  content: z.string().describe("New text content"),
});

export const notionUpdateBlockTool: Tool<typeof params> = {
  name: "notion_update_block",
  description: "Update a paragraph or heading block's content.",
  parameters: params,
  async execute({ blockId, blockType, content }) {
    const payload: Record<string, unknown> = {};
    if (blockType === "paragraph") {
      payload.paragraph = { rich_text: [{ text: { content } }] };
    } else if (blockType === "heading_1") {
      payload.heading_1 = { rich_text: [{ text: { content } }] };
    } else {
      payload.heading_2 = { rich_text: [{ text: { content } }] };
    }
    await notion.blocks.update({
      block_id: blockId.replace(/-/g, ""),
      ...payload,
    } as never);
    return `Updated block ${blockId}`;
  },
};
