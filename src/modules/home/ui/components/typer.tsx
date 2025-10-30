import TypingText from '@/components/ui/shadcn-io/typing-text';

export const Typer = () => {
  return (
    <TypingText
      text={['imagine', 'dream', 'build', 'create', 'design', 'launch']}
      typingSpeed={60}
      pauseDuration={2000}
      deletingSpeed={40}
      variableSpeed={{ min: 40, max: 80 }}
      cursorBlinkDuration={0.8}
      showCursor={true}
      className='underline decoration-primary decoration-2'
    />
  );
};
