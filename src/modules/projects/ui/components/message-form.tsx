import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextAreaAutosize from 'react-textarea-autosize';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Usage } from './usage';
import { useRouter } from 'next/navigation';

interface Props {
  projectId: string;
}

const formSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(10000, 'Message is too long'),
});

export const MessageForm = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const querryClient = useQueryClient();
  const router = useRouter();
  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        querryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );
        querryClient.invalidateQueries(trpc.usage.status.queryOptions());
      },
      onError: (error) => {
        toast.error(error.message);

        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          router.push('/pricing');
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
  const { data: usage } = useQuery(trpc.usage.status.queryOptions());
  const [isFocused, setIsFocused] = useState(false);
  const showUsage = !!usage;
  const isPending = createMessage.isPending;
  const isDisabled = isPending || !form.formState.isValid;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      value: values.message,
      projectId,
    });
  };

  return (
    <Form {...form}>
      {showUsage && (
        <Usage
          points={usage?.remainingPoints ?? 0}
          msBeforeNext={usage?.msBeforeNext ?? 0}
        />
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
          isFocused && 'shadow-xs',
          showUsage && 'rounded-t-none'
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
          <Button className={cn('size-8 rounded-full ')} disabled={isDisabled}>
            {isPending ? (
              <Loader2Icon className='size-4 animate-spin' />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
