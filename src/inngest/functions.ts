import { z } from 'zod';
import { inngest } from './client';
import {
  createAgent,
  createTool,
  createNetwork,
  type Tool,
  gemini,
} from '@inngest/agent-kit';
import { Sandbox } from 'e2b';
import { getSandbox, lastAssistantTextMessageContext } from './utils';
import { PROMPT } from '@/prompt';
import prisma from '@/lib/db';

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent' },
  async ({ event, step }) => {
    try {
      const sandboxId = await step.run('create-sandbox', async () => {
        const sandbox = await Sandbox.create('o7te0ovt3mepwlpibqie');
        return sandbox.sandboxId;
      });

      const codeAgent = createAgent<AgentState>({
        name: 'code-agent',
        system: PROMPT,
        model: gemini({
          model: 'gemini-2.5-flash',
          apiKey: process.env.GEMINI_API_KEY,
        }),
        tools: [
          createTool({
            name: 'terminal',
            description: 'Use the terminal to run commands',
            parameters: z.object({
              command: z.string(),
            }),
            handler: async ({ command }, { step }) => {
              return await step?.run('terminal', async () => {
                const buffers = { stdout: '', stderror: '' };

                try {
                  const sandbox = await getSandbox(sandboxId);
                  const result = await sandbox.commands.run(command, {
                    onStdout(data) {
                      buffers.stdout += data;
                    },
                    onStderr(data) {
                      buffers.stderror += data;
                    },
                  });
                  return result.stdout;
                } catch (e) {
                  console.error(
                    `Command failed ${e}\n stdout: ${buffers.stdout}\n stderror: ${buffers.stderror}`
                  );
                  return `Command failed ${e}\n stdout: ${buffers.stdout}\n stderror: ${buffers.stderror}`;
                }
              });
            },
          }),
          createTool({
            name: 'createOrUpdateFiles',
            description: 'Create or Update files in the sandbox',
            parameters: z.object({
              files: z.array(
                z.object({
                  path: z.string(),
                  content: z.string(),
                })
              ),
            }),
            handler: async (
              { files },
              { step, network }: Tool.Options<AgentState>
            ) => {
              const newFiles = await step?.run(
                'createOrUpdateFiles',
                async () => {
                  try {
                    const updatedFiles = network.state.data.files || {};
                    const sandbox = await getSandbox(sandboxId);
                    for (const file of files) {
                      await sandbox.files.write(file.path, file.content);
                      updatedFiles[file.path] = file.content;
                    }

                    return updatedFiles;
                  } catch (e) {
                    return 'Error on create or update' + e;
                  }
                }
              );
              if (typeof newFiles === 'object') {
                network.state.data.files = newFiles;
              }
            },
          }),
          createTool({
            name: 'readFiles',
            description: 'Read files from sandbox',
            parameters: z.object({
              files: z.array(z.string()),
            }),
            handler: async ({ files }, { step }) => {
              return await step?.run('readFiles', async () => {
                try {
                  const sandbox = await getSandbox(sandboxId);
                  const contents = [];
                  for (const file of files) {
                    const content = await sandbox.files.read(file);
                    contents.push({ path: file, content });
                  }
                  return JSON.stringify(contents);
                } catch (e) {
                  return 'Error on read: ' + e;
                }
              });
            },
          }),
        ],
        lifecycle: {
          onResponse: async ({ result, network }) => {
            const lastAssistantMessageText =
              lastAssistantTextMessageContext(result);

            if (lastAssistantMessageText && network) {
              if (lastAssistantMessageText?.includes('<task_summary>')) {
                network.state.data.summary = lastAssistantMessageText;
              }
            }
            return result;
          },
        },
      });

      const network = createNetwork<AgentState>({
        name: 'coding-agent-network',
        agents: [codeAgent],
        maxIter: 15,
        router: async ({ network }) => {
          const summary = network.state.data.summary;
          if (summary) {
            return;
          }
          return codeAgent;
        },
      });

      const result = await network.run(event.data.value);
      const isError =
        !result.state.data.summary ||
        Object.keys(result.state.data.files).length === 0;

      const sandboxURL = await step.run('get-sandbox-url', async () => {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      });

      await step.run('save-result', async () => {
        if (isError) {
          return await prisma.message.create({
            data: {
              content: 'Something went wrong. Please try again.',
              role: 'ASSISTANT',
              type: 'ERROR',
              projectId: event.data.projectId,
            },
          });
        }

        return await prisma.message.create({
          data: {
            content: result.state.data.summary,
            role: 'ASSISTANT',
            type: 'RESULT',
            projectId: event.data.projectId,
            fragment: {
              create: {
                sandboxUrl: sandboxURL,
                title: 'Fragment',
                files: result.state.data.files,
              },
            },
          },
        });
      });

      return {
        url: sandboxURL,
        title: 'Fragment',
        files: result.state.data.files,
        summary: result.state.data.summary,
      };
    } catch (error) {
      console.error('Code agent function failed:', error);

      await step.run('save-error', async () => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.';

        return await prisma.message.create({
          data: {
            content: `Error: ${errorMessage}`,
            role: 'ASSISTANT',
            type: 'ERROR',
            projectId: event.data.projectId,
          },
        });
      });

      throw error;
    }
  }
);
