'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export const ProjectList = () => {
  const trpc = useTRPC();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());

  return (
    <div className='w-full bg-white dark:bg-sidebar rounded-xl p-8 border flex flex-col gap-y-6 sm:gap-y-4'>
      <h2 className='text-2xl font-semibold'>Previous projects</h2>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
        {projects?.length === 0 && (
          <div className='col-span-full text-center'>
            <span className='text-sm text-muted-foreground'>
              No projects found
            </span>
          </div>
        )}
        {projects?.map((project) => (
          <Button
            key={project.id}
            variant='outline'
            className='font-normal h-auto justify-start w-full text-start p-4'
            asChild
          >
            <Link href={`/projects/${project.id}`}>
              <div className='flex items-center gap-x-2'>
                <Image
                  src='./logo.svg'
                  alt='logo'
                  width={32}
                  height={32}
                  className='object-contain dark:invert'
                />
                <div className='flex flex-col'>
                  <h3 className='truncate font-medium'>{project.name}</h3>
                  <p>
                    {formatDistanceToNow(project.updateAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
};
