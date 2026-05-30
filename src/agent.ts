import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.js';
import type { ToolRegistry } from './tool-registry.js';

const write = (text: string, isThought = false) => {
  if (isThought) {
    process.stdout.write(`\x1b[2m${text}\x1b[0m`);
  } else {
    process.stdout.write(text);
  }
};

export async function runAgent(
  userMessage: string,
  history: ChatCompletionMessageParam[],
  registry: ToolRegistry
): Promise<string | null> {
  console.log('Thinking...');
  const openai = new OpenAI();

  history.push({ role: 'user', content: userMessage });

  while (true) {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: history,
      tools: registry.getOpenAITools(),
      stream: true,
    });

    let content = '';
    const toolCallsMap = new Map<
      number,
      {
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
      }
    >();

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      const reasoning = (delta as { reasoning_content?: string })
        .reasoning_content;
      if (reasoning) {
        write(reasoning, true);
      }

      if (delta.content) {
        content += delta.content;
        write(delta.content);
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          const existing = toolCallsMap.get(idx);
          const acc = existing ?? {
            id: '',
            type: 'function' as const,
            function: { name: '', arguments: '' },
          };
          if (tc.id) acc.id = tc.id;
          if (tc.function?.name) acc.function.name = tc.function.name;
          if (tc.function?.arguments)
            acc.function.arguments += tc.function.arguments;
          toolCallsMap.set(idx, acc);
        }
      }
    }

    const toolCalls = Array.from(toolCallsMap.values()).filter(
      (tc) => tc.function.name
    );
    const message: ChatCompletionMessageParam = {
      role: 'assistant',
      content: content || null,
      ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
    };
    history.push(message);

    if (!toolCalls.length) {
      if (content) write('\n');
      return content || null;
    }

    write('\n\n');
    const results = await Promise.all(
      toolCalls.map(async (tc) => {
        if (tc.type !== 'function') return null;
        let content: string;
        try {
          content = await registry.executeTool(
            tc.function.name,
            JSON.parse(tc.function.arguments || '{}')
          );
        } catch (err) {
          content = `Error: ${err instanceof Error ? err.message : String(err)}`;
        }
        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content,
        };
      })
    );
    const valid = results.filter((r): r is NonNullable<typeof r> => r !== null);
    history.push(...valid);
  }
}
