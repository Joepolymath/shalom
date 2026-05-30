import 'dotenv/config';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { runAgent } from './agent.js';
import { ToolRegistry } from './tool-registry.js';
import { allTools } from './tools/index.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';

const rl = readline.createInterface({ input, output });
const registry = new ToolRegistry(allTools);

const BASE_SYSTEM_PROMPT =
  "Your name is Shalom. You are a helpful assistant that can help with tasks. You are currently running as a CLI tool on the user's Mac. You can manage the macOS Reminders, Notes, and Calendar apps (list, read, create, complete, and delete items) and send/read Messages. Use these tools when the user asks about their reminders, notes, calendar events, or messages. When a tool needs a date or time, always resolve relative expressions like \"today\", \"tomorrow\", or \"in 2 hours\" against the current date and time given below, and pass an ISO 8601 value.";

function systemMessage(): ChatCompletionMessageParam {
  return {
    role: 'system',
    content: `${BASE_SYSTEM_PROMPT}\n\nThe current date and time is ${new Date().toString()}.`,
  };
}

const history: ChatCompletionMessageParam[] = [systemMessage()];

async function main() {
  console.log('Shalom: Type your message (exit/quit to end).\n');

  while (true) {
    const line = await rl.question('> ');
    const trimmed = line.trim().toLowerCase();
    if (trimmed === 'exit' || trimmed === 'quit') {
      break;
    }
    if (!line.trim()) {
      continue;
    }

    try {
      history[0] = systemMessage();
      const result = await runAgent(line.trim(), history, registry);
      if (!result) console.log('(no response)');
      console.log();
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : err);
    }
  }

  rl.close();
}

main();
