import { z } from "zod";
import { notion } from "./client.js";
import type { Tool } from "../../types.js";

const params = z.object({
  blockId: z.string().describe("Parent block or page ID to list children of"),
  pageSize: z.number().optional().describe("Max blocks; default 50"),
});

function blockToText(block: Record<string, unknown>): string {
  const type = block.type as string;
  const content = block[type];
  if (content && typeof content === "object") {
    const rt = (content as Record<string, unknown>).rich_text;
    if (Array.isArray(rt) && rt[0] && typeof rt[0] === "object") {
      const t = rt[0] as { plain_text?: string };
      return t.plain_text ?? "";
    }
  }
  return "";
}

export const notionReadBlocksTool: Tool<typeof params> = {
  name: "notion_read_blocks",
  description: "List block children of a page or block.",
  parameters: params,
  async execute({ blockId, pageSize = 50 }) {
    const res = await notion.blocks.children.list({
      block_id: blockId.replace(/-/g, ""),
      page_size: pageSize,
    });
    const lines = res.results.map((b) => {
      const obj = b as { id?: string; type?: string };
      const text = blockToText(obj as Record<string, unknown>);
      return `${obj.type ?? "?"}: ${text || "(no text)"}`;
    });
    return lines.length > 0 ? lines.join("\n") : "(no blocks)";
  },
};
