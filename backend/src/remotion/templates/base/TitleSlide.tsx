import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface TitleSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, badge } = slide.visual;

  // Staggered spring animations
  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 15 } });
  const titleSpring = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const subSpring = spring({ frame: frame - 16, fps, config: { damping: 14 } });
  const barWidth = interpolate(frame, [10, 35], [0, 160], {
    extrapolateRight: 'clamp',
  });

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '1200px',
        }}
      >
        {/* Optional Topic Badge */}
        {badge && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: `${theme.primaryColor}20`,
              border: `1px solid ${theme.primaryColor}50`,
              color: theme.primaryColor,
              fontSize: '22px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '28px',
              opacity: badgeSpring,
              transform: `translateY(${interpolate(badgeSpring, [0, 1], [15, 0])}px)`,
            }}
          >
            {badge}
          </div>
        )}

        {/* Accent Bar */}
        <div
          style={{
            height: '6px',
            width: `${barWidth}px`,
            borderRadius: '3px',
            background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            marginBottom: '32px',
          }}
        />

        {/* Main Presentation Title */}
        <h1
          style={{
            fontSize: '76px',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 24px 0',
            letterSpacing: '-0.03em',
            color: theme.textColor,
            opacity: titleSpring,
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: '32px',
              fontWeight: 400,
              lineHeight: 1.4,
              margin: 0,
              color: theme.textMutedColor,
              maxWidth: '950px',
              opacity: subSpring,
              transform: `translateY(${interpolate(subSpring, [0, 1], [25, 0])}px)`,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </SlideWrapper>
  );
};
