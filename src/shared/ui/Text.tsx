import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { styled } from 'nativewind';

const StyledText = styled(RNText);

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className, ...props }: TextProps) {
  return <StyledText className={className} {...props} />;
}
