import { z } from "zod";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Tool } from "../../types.js";

const params = z.object({
  path: z.string().describe("Root directory path"),
  maxDepth: z.number().optional().describe("Maximum depth to traverse; default 3"),
});

async function buildTree(dir: string, prefix: string, depth: number, maxDepth: number): Promise<string[]> {
  if (depth >= maxDepth) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const lines: string[] = [];
  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() === b.isDirectory()) return a.name.localeCompare(b.name);
    return a.isDirectory() ? -1 : 1;
  });
  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i]!;
    const isLast = i === sorted.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const name = e.isDirectory() ? `${e.name}/` : e.name;
    lines.push(`${prefix}${connector}${name}`);
    if (e.isDirectory()) {
      const subPrefix = prefix + (isLast ? "    " : "│   ");
      const sub = await buildTree(join(dir, e.name), subPrefix, depth + 1, maxDepth);
      lines.push(...sub);
    }
  }
  return lines;
}

export const directoryTreeTool: Tool<typeof params> = {
  name: "directory_tree",
  description: "Print a recursive directory tree with depth limit.",
  parameters: params,
  async execute({ path, maxDepth = 3 }) {
    const lines = await buildTree(path, "", 0, maxDepth);
    return lines.length > 0 ? lines.join("\n") : "(empty)";
  },
};
