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

  const headerSpring = spring({ frame, fps, config: { damping: 22, mass: 0.8 } });
  const freezeFrame = Math.min(70, Math.max(50, 10 + bullets.length * 10 + 20));

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath} freezeFrame={freezeFrame}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Slide Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '56px',
              fontWeight: 800,
              margin: '0 0 16px 0',
              letterSpacing: '-0.03em',
              color: theme.textColor,
              opacity: headerSpring,
              transform: `translateY(${interpolate(headerSpring, [0, 1], [25, 0])}px)`,
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
                letterSpacing: '-0.01em',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Clean, Fast-Rendering Bullet Cards */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '20px',
            maxWidth: '1450px',
          }}
        >
          {bullets.map((point, index) => {
            const itemDelay = 6 + index * 8;
            const itemSpring = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 20, mass: 0.8, stiffness: 95 },
            });

            const translateY = interpolate(itemSpring, [0, 1], [25, 0]);

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                  backgroundColor: theme.surfaceColor,
                  border: `1px solid ${theme.primaryColor}22`,
                  borderRadius: '20px',
                  padding: '24px 36px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  opacity: itemSpring,
                  transform: `translateY(${translateY}px)`,
                }}
              >
                {/* Number Badge with subtle primary accent */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    backgroundColor: `${theme.primaryColor}15`,
                    border: `1px solid ${theme.primaryColor}40`,
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
                    letterSpacing: '-0.01em',
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
