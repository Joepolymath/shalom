import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  blockId: z.string().describe("Parent block ID (or page ID) to append to"),
  blockType: z.enum(["paragraph", "heading_1", "heading_2", "bulleted_list_item"]).describe("Block type"),
  content: z.string().describe("Text content for the block"),
});

export const notionCreateBlockTool: Tool<typeof params> = {
  name: "notion_create_block",
  description: "Append a new block (paragraph, heading, or list item) to a page or block.",
  parameters: params,
  async execute({ blockId, blockType, content }) {
    const children: Array<Record<string, unknown>> = [];
    if (blockType === "paragraph") {
      children.push({ paragraph: { rich_text: [{ text: { content } }] } });
    } else if (blockType === "heading_1") {
      children.push({ heading_1: { rich_text: [{ text: { content } }] } });
    } else if (blockType === "heading_2") {
      children.push({ heading_2: { rich_text: [{ text: { content } }] } });
    } else {
      children.push({ bulleted_list_item: { rich_text: [{ text: { content } }] } });
    }
    const res = await notion.blocks.children.append({
      block_id: blockId.replace(/-/g, ""),
      children: children as never,
    });
    return `Created block: ${res.results[0]?.id ?? "ok"}`;
  },
};
