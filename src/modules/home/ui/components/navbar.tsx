'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { UserControl } from './user-control';
import { useScroll } from '@/hooks/use-scroll';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const isScrolled = useScroll();

  return (
    <nav
      className={cn(
        'p-4 bg-transparent fixed top-0 left-0 right-0 z-1 transition-all duration-200 border-b border-transparent',
        isScrolled && 'bg-background border ease-in-out'
      )}
    >
      <div className='max-w-5xl mx-auto w-full flex justify-between items-center'>
        <Link href='/' className='flex items-center gap-2'>
          <Image
            src='/logo.svg'
            alt='logo'
            width={32}
            height={32}
            className='dark:invert'
            suppressHydrationWarning
          />
          <span className='font-semibold text-lg'>Pygmalion</span>
        </Link>

        <SignedOut>
          <div className='flex gap-2'>
            <SignInButton>
              <Button variant='outline' size='sm'>
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size='sm'>Sign up</Button>
            </SignUpButton>
          </div>
        </SignedOut>

        <SignedIn>
          <UserControl showName />
        </SignedIn>
      </div>
    </nav>
  );
};
