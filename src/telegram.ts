import 'dotenv/config';
import express from 'express';
import { Bot, webhookCallback } from 'grammy';
import { runAgent } from './agent.js';
import { ToolRegistry } from './tool-registry.js';
import { allTools } from './tools/index.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';

const { TELEGRAM_BOT_TOKEN, WEBHOOK_URL, PORT: envPort, TELEGRAM_ALLOWED_USERS } = process.env;

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is required');
}

if (!WEBHOOK_URL) {
  throw new Error('WEBHOOK_URL is required (the public URL of this server)');
}

const bot = new Bot(TELEGRAM_BOT_TOKEN);
const registry = new ToolRegistry(allTools);
const PORT = Number(envPort) || 3000;
const WEBHOOK_PATH = `/webhook/${bot.token}`;

const allowedUsers: Set<number> | null = TELEGRAM_ALLOWED_USERS
  ? new Set(TELEGRAM_ALLOWED_USERS.split(',').map(Number))
  : null;

const sessions = new Map<number, ChatCompletionMessageParam[]>();

function getHistory(chatId: number): ChatCompletionMessageParam[] {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, [
      {
        role: 'system',
        content:
          'Your name is Shalom. You are a helpful assistant that can help with tasks. You are currently running as a Telegram bot.',
      },
    ]);
  }
  return sessions.get(chatId)!;
}

function splitMessage(text: string, maxLen = 4096): string[] {
  const parts: string[] = [];
  for (let i = 0; i < text.length; i += maxLen) {
    parts.push(text.slice(i, i + maxLen));
  }
  return parts;
}

bot.use(async (ctx, next) => {
  if (allowedUsers && ctx.from && !allowedUsers.has(ctx.from.id)) {
    await ctx.reply('Sorry, you are not authorized to use this bot.');
    return;
  }
  await next();
});

bot.command('start', (ctx) =>
  ctx.reply('Hello! I am Shalom. Send me a message and I will help you.')
);

bot.command('reset', (ctx) => {
  sessions.delete(ctx.chat.id);
  return ctx.reply('Conversation reset.');
});

bot.on('message:text', async (ctx) => {
  const history = getHistory(ctx.chat.id);

  try {
    const result = await runAgent(ctx.message.text, history, registry);
    const text = result || '(no response)';
    for (const part of splitMessage(text)) {
      await ctx.reply(part);
    }
  } catch (err) {
    await ctx.reply(
      `Error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
});

const app = express();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(WEBHOOK_PATH, express.json());
app.post(WEBHOOK_PATH, webhookCallback(bot, 'express'));

app.listen(PORT, async () => {
  await bot.api.setWebhook(`${WEBHOOK_URL}${WEBHOOK_PATH}`);
  console.log(`Webhook set to ${WEBHOOK_URL}${WEBHOOK_PATH}`);
  console.log(`Shalom Telegram bot running on port ${PORT}`);
});
