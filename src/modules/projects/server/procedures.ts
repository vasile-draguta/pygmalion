import { baseProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import prisma from '@/lib/db';
import { inngest } from '@/inngest/client';
import { generateSlug } from 'random-word-slugs';
import { TRPCError } from '@trpc/server';

export const projectsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Project id is required'),
      })
    )
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.id },
      });

      if (!project) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Project with ${input.id} does not exist!`,
        });
      }

      return project;
    }),

  getMany: baseProcedure.query(async () => {
    const projects = await prisma.project.findMany({
      orderBy: {
        updateAt: 'desc',
      },
    });

    return projects;
  }),

  create: baseProcedure
    .input(
      z.object({
        value: z
          .string()
          .min(1, { message: 'Message is required' })
          .max(10000, 'Message is too long'),
      })
    )
    .mutation(async ({ input }) => {
      const createdProject = await prisma.project.create({
        data: {
          name: generateSlug(2, {
            format: 'kebab',
          }),
          messages: {
            create: {
              content: input.value,
              role: 'USER',
              type: 'RESULT',
            },
          },
        },
      });

      await inngest.send({
        name: 'code-agent',
        data: {
          value: input.value,
          projectId: createdProject.id,
        },
      });

      return createdProject;
    }),
});
