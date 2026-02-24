import React from 'react';
import Svg, { Rect, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';

interface LivePlaceNumberMarkerProps {
  number: number;
  width?: number;
  height?: number;
}

export function LivePlaceNumberMarker({ number, width = 30, height = 30 }: LivePlaceNumberMarkerProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 30 30" fill="none">
      <Defs>
        <RadialGradient
          id="paint0_radial_live_place"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(15 15) rotate(90) scale(15)"
        >
          <Stop stopColor="#FFB3A1" />
          <Stop offset="1" stopColor="#FFB3A1" stopOpacity={0.7} />
        </RadialGradient>
      </Defs>
      <Rect
        x="0.5"
        y="0.5"
        width="29"
        height="29"
        rx="14.5"
        fill="url(#paint0_radial_live_place)"
      />
      <Rect
        x="0.5"
        y="0.5"
        width="29"
        height="29"
        rx="14.5"
        stroke="#FFB3A1"
      />
      <SvgText
        x="15"
        y="21"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
      >
        {number}
      </SvgText>
    </Svg>
  );
}
