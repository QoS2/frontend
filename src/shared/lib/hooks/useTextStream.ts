import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextStreamProps {
  text: string;
  speed?: number;
  autoStart?: boolean;
}

export function useTextStream({ text, speed = 30, autoStart = true }: UseTextStreamProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startStreaming = useCallback(() => {
    if (timerRef.current) return;

    setIsComplete(false);
    setDisplayedText('');
    setCurrentIndex(0);

    let index = 0;
    timerRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
        setCurrentIndex(index);
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsComplete(true);
      }
    }, speed);
  }, [text, speed]);

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayedText(text);
    setCurrentIndex(text.length);
    setIsComplete(true);
  }, [text]);

  useEffect(() => {
    if (autoStart) {
      startStreaming();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoStart, startStreaming]);

  return { displayedText, isComplete, currentIndex, skip, startStreaming };
}
