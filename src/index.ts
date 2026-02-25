import 'dotenv/config';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { runAgent } from './agent.js';
import { ToolRegistry } from './tool-registry.js';
import { allTools } from './tools/index.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';

const rl = readline.createInterface({ input, output });
const registry = new ToolRegistry(allTools);
const history: ChatCompletionMessageParam[] = [
  {
    role: 'system',
    content:
      'Your name is Shalom. You are a helpful assistant that can help with tasks. You are currently running as a CLI tool.',
  },
];

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
