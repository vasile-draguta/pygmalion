'use client';

import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextAreaAutosize from 'react-textarea-autosize';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { PROJECT_TEMPLATES } from '../../constants';
import { useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';

const formSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(10000, 'Message is too long'),
});

export const ProjectForm = () => {
  const router = useRouter();
  const trpc = useTRPC();
  const clerk = useClerk();
  const querryClient = useQueryClient();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        querryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        querryClient.invalidateQueries(trpc.usage.status.queryOptions());
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.redirectToSignIn();
        }
        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          router.push('/pricing');
          toast.error('You have reached the maximum number of requests!');
        }
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  const onSelectTemplate = (prompt: string) => {
    form.setValue('message', prompt, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const isPending = createProject.isPending;
  const isDisabled = isPending || !form.formState.isValid;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: values.message,
    });
  };

  return (
    <Form {...form}>
      <section className='space-y-6'>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn(
            'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
            isFocused && 'shadow-xs'
          )}
        >
          <FormField
            control={form.control}
            name='message'
            render={({ field }) => (
              <TextAreaAutosize
                {...field}
                disabled={isPending}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                minRows={2}
                maxRows={8}
                className='pt-4 resize-none border-none w-full outline-none bg-transparent'
                placeholder='What would you like to build?'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                  }
                }}
              />
            )}
          />
          <div className='flex gap-x-2 items-end justify-between pt-2'>
            <div className='text-[10px] text-muted-foreground font-mono'>
              <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
                <span>&#8984;Enter</span>
              </kbd>
              &nbsp;to submit
            </div>
            <Button
              className={cn('size-8 rounded-full ')}
              disabled={isDisabled}
            >
              {isPending ? (
                <Loader2Icon className='size-4 animate-spin' />
              ) : (
                <ArrowUpIcon />
              )}
            </Button>
          </div>
        </form>
        <div className='flex-wrap justify-center gap-2 hidden md:flex max-w-3xl'>
          {PROJECT_TEMPLATES.map((template) => (
            <Button
              key={template.title}
              variant='outline'
              size='sm'
              className='bg-white dark:bg-sidebar'
              onClick={() => onSelectTemplate(template.prompt)}
            >
              <span className='text-xs mr-2'>{template.emoji}</span>
              {template.title}
            </Button>
          ))}
        </div>
      </section>
    </Form>
  );
};
