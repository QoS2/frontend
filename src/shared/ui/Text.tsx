import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  className?: string;
}

export function Text({ className, ...props }: TextProps) {
  return <RNText className={className} {...props} />;
}
