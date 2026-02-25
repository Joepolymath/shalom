import { Client } from "@notionhq/client";

const key = process.env.NOTION_API_KEY;
if (!key) {
  console.warn("NOTION_API_KEY not set. Notion tools will fail.");
}

export const notion = new Client({ auth: key ?? "" });
