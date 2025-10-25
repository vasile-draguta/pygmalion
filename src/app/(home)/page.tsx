import Image from 'next/image';
import { ProjectForm } from '@/modules/home/ui/project-form';
import { ProjectList } from '@/modules/home/ui/project-list';

const Page = () => {
  return (
    <div className='flex flex-col max-w-5xl mx-auto w-full'>
      <section className='space-y-6 py-[16vh] 2xl:py-48'>
        <div className='flex flex-col items-center gap-y-6'>
          <Image
            src='./logo.svg'
            alt='logo'
            width={50}
            height={50}
            className='hidden md:block dark:invert'
          />
        </div>
        <h1 className='text-2xl md:text-5xl font-bold text-center'>
          Let Pygmalion build something
        </h1>
        <p className='text-lg md:text-cl text-muted-foreground text-center'>
          Create apps and website by chatting with AI
        </p>
        <div className='max-w-3xl mx-auto w-full'>
          <ProjectForm />
        </div>
        <div className='max-w-3xl mx-auto w-full'>
          <ProjectList />
        </div>
      </section>
    </div>
  );
};

export default Page;
