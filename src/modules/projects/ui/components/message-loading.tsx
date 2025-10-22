import Image from 'next/image';
import { useState, useEffect } from 'react';

export const ShimmerMessages = () => {
  const messages: string[] = [
    'Thinking...',
    'Loading...',
    'Fetching Dependencies...',
    'Analysing Your Request...',
    'Building Your Response...',
    'Crafting Components...',
    'Styling Your Response...',
    'Adding Interactivity...',
    'Polishing Your Response...',
    'Finishing Up...',
  ];

  const [currentMessageIndex, setCurrentMesageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMesageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className='flex items-center gap-2'>
      <span className='text-base text-muted-foreground animate-pulse'>
        {messages[currentMessageIndex]}
      </span>
    </div>
  );
};

export const MessageLoading = () => {
  return (
    <div className='flex flex-col group px-2 pb-4'>
      <div className='flex items-center gap-2 pl-2 mb-2'>
        <Image
          src='/logo.svg'
          alt='logo'
          width={18}
          height={18}
          className='shrink-0 dark:invert'
        />
        <span className='text-sm font-medium'>Mishulika</span>
      </div>
      <div className='pl-8.5 flex flex-col gap-y-4'>
        <ShimmerMessages />
      </div>
    </div>
  );
};
