import { success } from 'zod';
import { inngest } from './client';
import { Agent, gemini, createAgent } from '@inngest/agent-kit';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event }) => {
    const codeAgent = createAgent({
      name: 'code-agent',
      system:
        'You are an expert Next.js developer. You write redable, maintanable code. You write simple Next.js & React snippets',
      model: gemini({ model: 'gemini-2.5-flash' }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet ${event.data.value}`
    );

    return { output };
  }
);
