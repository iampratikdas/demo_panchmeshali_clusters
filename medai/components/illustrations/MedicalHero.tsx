import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
  Rect,
} from 'react-native-svg';
import { colors } from '@/theme';

export interface MedicalHeroProps {
  width?: number;
  height?: number;
}

export function MedicalHero({ width = 280, height = 280 }: MedicalHeroProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 280" fill="none">
      <Circle cx="140" cy="140" r="120" fill={colors.primaryMuted} />
      <Circle cx="220" cy="58" r="18" fill={colors.primary} opacity={0.55} />
      <Circle cx="52" cy="210" r="12" fill={colors.secondary} opacity={0.35} />

      <Ellipse cx="140" cy="228" rx="72" ry="10" fill="#111827" opacity={0.08} />

      <G>
        <Path
          d="M92 118c0-26.51 21.49-48 48-48s48 21.49 48 48v58c0 8.28-6.72 15-15 15H107c-8.28 0-15-6.72-15-15v-58z"
          fill="#FFFFFF"
        />
        <Path
          d="M118 92c6-14 18-22 22-22s16 8 22 22"
          stroke={colors.textPrimary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Circle cx="124" cy="118" r="5" fill={colors.textPrimary} />
        <Circle cx="156" cy="118" r="5" fill={colors.textPrimary} />
        <Path
          d="M132 136c4 4 12 4 16 0"
          stroke={colors.textPrimary}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </G>

      <Path
        d="M118 176h44v34c0 6.63-5.37 12-12 12h-20c-6.63 0-12-5.37-12-12v-34z"
        fill={colors.textPrimary}
      />
      <Rect x="108" y="168" width="64" height="16" rx="8" fill={colors.secondary} />

      <G>
        <Path
          d="M188 154c18 0 32 14 32 32s-14 32-32 32"
          stroke={colors.textPrimary}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <Circle cx="188" cy="186" r="16" fill={colors.primary} />
        <Circle cx="188" cy="186" r="8" fill={colors.textPrimary} />
        <Path
          d="M176 198c8 10 24 10 32 0"
          stroke={colors.textPrimary}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </G>

      <G>
        <Rect x="56" y="92" width="34" height="48" rx="10" fill={colors.card} />
        <Rect x="62" y="100" width="22" height="4" rx="2" fill={colors.border} />
        <Rect x="62" y="110" width="18" height="4" rx="2" fill={colors.border} />
        <Rect x="62" y="120" width="20" height="4" rx="2" fill={colors.border} />
        <Path
          d="M73 132v14"
          stroke={colors.secondary}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Path
          d="M66 139h14"
          stroke={colors.secondary}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </G>

      <G>
        <Circle cx="210" cy="118" r="22" fill={colors.card} />
        <Path
          d="M210 106v24M198 118h24"
          stroke={colors.secondary}
          strokeWidth="5"
          strokeLinecap="round"
        />
      </G>

      <Path
        d="M96 74l12-8 12 8-4 14H100l-4-14z"
        fill={colors.primary}
      />
    </Svg>
  );
}
