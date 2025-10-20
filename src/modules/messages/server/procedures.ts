import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';

export const messageRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    const messages = await prisma.message.findMany({
      orderBy: {
        updateAt: 'asc',
      },
    });

    return messages;
  }),

  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: 'Message is required' }),
      })
    )
    .mutation(async ({ input }) => {
      const newMessage = await prisma.message.create({
        data: {
          content: input.value,
          role: 'USER',
          type: 'RESULT',
        },
      });
      await inngest.send({
        name: 'code-agent',
        data: {
          value: input.value,
        },
      });

      return newMessage;
    }),
});
