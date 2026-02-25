import { z } from "zod";
import type { ChatCompletionTool } from "openai/resources/chat/completions.js";
import type { Tool } from "./types.js";

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  constructor(tools: Tool[]) {
    for (const tool of tools) {
      this.tools.set(tool.name, tool);
    }
  }

  getOpenAITools(): ChatCompletionTool[] {
    return Array.from(this.tools.values()).map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: z.toJSONSchema(tool.parameters),
      },
    }));
  }

  async executeTool(name: string, args: unknown): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      return `Error: Unknown tool "${name}"`;
    }
    const parsed = tool.parameters.parse(args);
    return tool.execute(parsed);
  }
}
