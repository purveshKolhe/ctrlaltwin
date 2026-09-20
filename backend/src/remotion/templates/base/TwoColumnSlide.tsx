import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface TwoColumnSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const TwoColumnSlide: React.FC<TwoColumnSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, badge, highlightCard, bullets } = slide.visual;

  // Staggered Apple-style springs (settles completely by frame 45)
  const leftHeaderSpring = spring({ frame: frame - 2, fps, config: { damping: 22, mass: 0.8 } });
  const leftContentSpring = spring({ frame: frame - 10, fps, config: { damping: 22, mass: 0.8 } });
  const rightCardSpring = spring({ frame: frame - 16, fps, config: { damping: 20, mass: 0.8, stiffness: 90 } });
  const rightInnerSpring = spring({ frame: frame - 24, fps, config: { damping: 22, mass: 0.8 } });

  const leftY = interpolate(leftHeaderSpring, [0, 1], [30, 0]);
  const rightY = interpolate(rightCardSpring, [0, 1], [35, 0]);

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath} freezeFrame={45}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '70px',
        }}
      >
        {/* Left Column: Narrative & Context (Canva Borcelle PDF p. 2 & 6 style) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: leftHeaderSpring,
            transform: `translateY(${leftY}px)`,
          }}
        >
          {badge && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 18px',
                borderRadius: '9999px',
                backgroundColor: `${theme.primaryColor}14`,
                border: `1px solid ${theme.primaryColor}30`,
                fontSize: '18px',
                fontWeight: 600,
                color: theme.primaryColor,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '24px',
                width: 'fit-content',
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

          <h2
            style={{
              fontSize: '54px',
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              color: theme.textColor,
              margin: '0 0 24px 0',
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                fontSize: '26px',
                fontWeight: 400,
                lineHeight: 1.55,
                color: theme.textMutedColor,
                margin: '0 0 28px 0',
                opacity: leftContentSpring,
              }}
            >
              {subtitle}
            </p>
          )}

          {bullets && bullets.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                opacity: leftContentSpring,
              }}
            >
              {bullets.map((b, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: theme.primaryColor,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '22px', color: theme.textColor, fontWeight: 500 }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Clean White Clinical Card */}
        <div
          style={{
            flex: 1,
            backgroundColor: theme.surfaceColor,
            border: `1px solid ${theme.primaryColor}25`,
            borderRadius: '28px',
            padding: '48px',
            boxShadow: '0 16px 36px -10px rgba(2, 132, 199, 0.08), 0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            opacity: rightCardSpring,
            transform: `translateY(${rightY}px)`,
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '48px',
              right: '48px',
              height: '4px',
              borderRadius: '0 0 4px 4px',
              background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            }}
          />

          {highlightCard ? (
            <div style={{ opacity: rightInnerSpring }}>
              {highlightCard.stat && (
                <div
                  style={{
                    fontSize: '64px',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    color: theme.primaryColor,
                    marginBottom: '12px',
                    lineHeight: 1,
                  }}
                >
                  {highlightCard.stat}
                </div>
              )}
              <h3
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: theme.textColor,
                  margin: '0 0 16px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                {highlightCard.title}
              </h3>
              {highlightCard.subtitle && (
                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: theme.secondaryColor,
                    margin: '0 0 16px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {highlightCard.subtitle}
                </p>
              )}
              {highlightCard.text && (
                <p
                  style={{
                    fontSize: '22px',
                    lineHeight: 1.6,
                    color: theme.textMutedColor,
                    margin: 0,
                  }}
                >
                  {highlightCard.text}
                </p>
              )}
            </div>
          ) : (
            <div style={{ opacity: rightInnerSpring }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: `${theme.primaryColor}12`,
                  color: theme.primaryColor,
                  fontWeight: 600,
                  fontSize: '18px',
                  marginBottom: '20px',
                }}
              >
                Clinical Insight
              </div>
              <p
                style={{
                  fontSize: '24px',
                  lineHeight: 1.65,
                  color: theme.textColor,
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                {slide.narration.script || 'Comprehensive personalized care designed for optimal outcomes.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </SlideWrapper>
  );
};
