import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  blockId: z.string().describe("Block ID to archive"),
});

export const notionDeleteBlockTool: Tool<typeof params> = {
  name: "notion_delete_block",
  description: "Archive (soft-delete) a Notion block.",
  parameters: params,
  async execute({ blockId }) {
    await notion.blocks.delete({ block_id: blockId.replace(/-/g, "") });
    return `Archived block ${blockId}`;
  },
};
