import type { z } from "zod";

export interface Tool<T extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  parameters: T;
  execute: (args: z.infer<T>) => Promise<string>;
}
