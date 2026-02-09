import React from 'react';
import { View } from 'react-native';

interface SpacingProps {
  size?: number;
  horizontal?: boolean;
}

export function Spacing({ size = 16, horizontal = false }: SpacingProps) {
  if (horizontal) {
    return <View style={{ width: size }} />;
  }
  return <View style={{ height: size }} />;
}
