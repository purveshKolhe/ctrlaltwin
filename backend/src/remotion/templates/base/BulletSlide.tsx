import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface BulletSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const BulletSlide: React.FC<BulletSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, bullets = [] } = slide.visual;

  // Header animations
  const headerSpring = spring({ frame, fps, config: { damping: 14 } });

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Slide Header */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '52px',
              fontWeight: 800,
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
              color: theme.textColor,
              opacity: headerSpring,
              transform: `translateY(${interpolate(headerSpring, [0, 1], [20, 0])}px)`,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                fontSize: '26px',
                color: theme.textMutedColor,
                margin: 0,
                opacity: headerSpring,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Staggered Bullet Points */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '24px',
            maxWidth: '1400px',
          }}
        >
          {bullets.map((point, index) => {
            // Stagger each bullet reveal by 12 frames
            const itemDelay = 12 + index * 12;
            const itemSpring = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 14, stiffness: 90 },
            });

            const translateY = interpolate(itemSpring, [0, 1], [30, 0]);

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                  backgroundColor: theme.surfaceColor,
                  border: `1px solid ${theme.primaryColor}25`,
                  borderRadius: '16px',
                  padding: '24px 32px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  opacity: itemSpring,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                {/* Index / Bullet Indicator */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${theme.primaryColor}20`,
                    border: `1px solid ${theme.primaryColor}60`,
                    color: theme.primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>

                {/* Point Text */}
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    color: theme.textColor,
                  }}
                >
                  {point}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </SlideWrapper>
  );
};
