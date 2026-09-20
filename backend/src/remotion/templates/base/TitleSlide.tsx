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

  // Apple-style sleek springs (clean transform & opacity without heavy blur)
  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 22, mass: 0.8 } });
  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 22, mass: 0.8 } });
  const subSpring = spring({ frame: frame - 12, fps, config: { damping: 22, mass: 0.8 } });

  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const subY = interpolate(subSpring, [0, 1], [20, 0]);

  const barWidth = interpolate(frame, [6, 28], [0, 140], {
    extrapolateRight: 'clamp',
  });

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath} freezeFrame={35}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          maxWidth: '1350px',
        }}
      >
        {/* Apple-style clean status pill badge */}
        {badge && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 22px',
              borderRadius: '9999px',
              backgroundColor: `${theme.primaryColor}14`,
              border: `1px solid ${theme.primaryColor}35`,
              fontSize: '20px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: theme.primaryColor,
              marginBottom: '32px',
              opacity: badgeSpring,
              transform: `translateY(${interpolate(badgeSpring, [0, 1], [15, 0])}px)`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: theme.primaryColor,
              }}
            />
            {badge}
          </div>
        )}

        {/* Accent expanding line */}
        <div
          style={{
            height: '4px',
            width: `${barWidth}px`,
            borderRadius: '2px',
            background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            marginBottom: '36px',
          }}
        />

        {/* Crisp high-contrast Title */}
        <h1
          style={{
            fontSize: '84px',
            fontWeight: 800,
            lineHeight: 1.12,
            margin: '0 0 28px 0',
            letterSpacing: '-0.04em',
            color: theme.textColor,
            opacity: titleSpring,
            transform: `translateY(${titleY}px)`,
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
              lineHeight: 1.45,
              margin: 0,
              color: theme.textMutedColor,
              maxWidth: '1100px',
              letterSpacing: '-0.01em',
              opacity: subSpring,
              transform: `translateY(${subY}px)`,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </SlideWrapper>
  );
};
