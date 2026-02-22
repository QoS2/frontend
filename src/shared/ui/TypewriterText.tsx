import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Text } from './Text';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * TypewriterText Component
 * 한 글자씩 타이핑되는 효과를 주는 컴포넌트입니다.
 * 
 * @param text - 전체 텍스트 내용
 * @param speed - 글자 사이의 간격 (ms). 값이 클수록 천천히 타이핑됩니다. (기본값: 60)
 * @param onComplete - 타이핑 완료 시 실행될 콜백
 */
export function TypewriterText({ 
  text = '', 
  speed = 60, 
  onComplete, 
  className,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const onCompleteRef = useRef(onComplete);

  // Update ref when onComplete changes without restarting effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    let index = 0;
    setDisplayedText('');

    const intervalId = setInterval(() => {
      if (index < text.length) {
        const char = text.charAt(index);
        setDisplayedText((prev) => prev + char);
        index++;
      } else {
        clearInterval(intervalId);
        onCompleteRef.current?.();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <View className="flex-row flex-wrap">
      <Text className={className}>
        {displayedText}
      </Text>
    </View>
  );
}
