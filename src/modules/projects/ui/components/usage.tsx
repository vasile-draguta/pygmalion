import Link from 'next/link';
import { CrownIcon } from 'lucide-react';
import { formatDuration, intervalToDuration } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';

interface Props {
  points: number;
  msBeforeNext: number;
}

export const Usage = ({ points, msBeforeNext }: Props) => {
  const { has } = useAuth();
  const hasPremium = has?.({
    plan: 'pro',
  });

  return (
    <div className='rounded-t-xl bg-background border border-b-0 p-2.5'>
      <div className='flex items-center gap-x-2'>
        <div>
          <p className='text-sm'>
            {points} credit{points > 1 ? 's' : ''} remaining
          </p>
          <p className='text-xs text-muted-foreground'>
            Resets in{' '}
            {formatDuration(
              intervalToDuration({
                start: new Date(),
                end: new Date(Date.now() + msBeforeNext),
              }),
              { format: ['months', 'days', 'hours'] }
            )}
          </p>
        </div>
        {!hasPremium && (
          <Button asChild size='sm' variant='tertiary' className='ml-auto'>
            <Link href='/pricing'>
              <CrownIcon /> Upgrade
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
