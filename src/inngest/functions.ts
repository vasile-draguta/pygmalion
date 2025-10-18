import { success } from 'zod';
import { inngest } from './client';
import { Agent, gemini, createAgent } from '@inngest/agent-kit';
import { Sandbox } from 'e2b';
import { getSandbox } from './utils';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    const sandboxId = await step.run('create-sandbox', async () => {
      const sandbox = await Sandbox.create('pygmalion-next-js');
      return sandbox.sandboxId;
    });

    await step.run('start-nextjs-server', async () => {
      const sandbox = await getSandbox(sandboxId);

      // Start Next.js with npm run dev
      sandbox.commands.run(
        'cd /home/user && npm run dev -- --hostname 0.0.0.0'
      );

      await new Promise((resolve) => setTimeout(resolve, 8000));
    });

    // const codeAgent = createAgent({
    //   name: 'code-agent',
    //   system:
    //     'You are an expert Next.js developer. You write redable, maintanable code. You write simple Next.js & React snippets',
    //   model: gemini({ model: 'gemini-2.5-flash' }),
    // });

    // const { output } = await codeAgent.run(
    //   `Write the following snippet ${event.data.value}`
    // );

    const sandboxURL = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { sandboxURL };
  }
);
