import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

export const messageRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        projectId: z.string().min(1, { message: 'Project id is required' }),
      })
    )
    .query(async ({ input }) => {
      const messages = await prisma.message.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          fragment: true,
        },
        orderBy: {
          updateAt: 'asc',
        },
      });

      return messages;
    }),

  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Message is required' })
          .max(10000, 'Message is too long'),
        projectId: z.string().min(1, { message: 'Project id is required' }),
      })
    )
    .mutation(async ({ input }) => {
      const newMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: 'USER',
          type: 'RESULT',
          projectId: input.projectId,
        },
      });
      await inngest.send({
        name: 'code-agent',
        data: {
          value: input.value,
          projectId: input.projectId,
        },
      });

      return newMessage;
    }),
});
