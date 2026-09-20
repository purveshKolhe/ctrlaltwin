import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface ConclusionSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const ConclusionSlide: React.FC<ConclusionSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, badge, bullets, footerText } = slide.visual;

  const badgeSpring = spring({ frame: frame - 2, fps, config: { damping: 22, mass: 0.8 } });
  const titleSpring = spring({ frame: frame - 6, fps, config: { damping: 22, mass: 0.8 } });
  const contentSpring = spring({ frame: frame - 14, fps, config: { damping: 22, mass: 0.8 } });
  const footerSpring = spring({ frame: frame - 22, fps, config: { damping: 22, mass: 0.8 } });

  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);
  const contentY = interpolate(contentSpring, [0, 1], [25, 0]);

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath} freezeFrame={50}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          height: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Branding Badge (Canva Borcelle PDF p. 10 style) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            borderRadius: '9999px',
            backgroundColor: `${theme.primaryColor}14`,
            border: `1px solid ${theme.primaryColor}35`,
            fontSize: '19px',
            fontWeight: 600,
            color: theme.primaryColor,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '32px',
            opacity: badgeSpring,
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
          {badge || 'Borcelle Hospital • Care at Every Step'}
        </div>

        {/* Big Thank You Headline */}
        <h1
          style={{
            fontSize: '92px',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: theme.textColor,
            margin: '0 0 24px 0',
            opacity: titleSpring,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title || 'Thank You'}
        </h1>

        {/* Subtitle / Closing Message */}
        {subtitle && (
          <p
            style={{
              fontSize: '30px',
              fontWeight: 400,
              lineHeight: 1.5,
              color: theme.textMutedColor,
              margin: '0 0 36px 0',
              maxWidth: '900px',
              opacity: contentSpring,
              transform: `translateY(${contentY}px)`,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Key Takeaway Pill Badges if bullets present */}
        {bullets && bullets.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '40px',
              maxWidth: '1000px',
              opacity: contentSpring,
            }}
          >
            {bullets.map((b, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: theme.surfaceColor,
                  border: `1px solid ${theme.primaryColor}30`,
                  borderRadius: '16px',
                  padding: '14px 28px',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: theme.textColor,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                }}
              >
                {b}
              </div>
            ))}
          </div>
        )}

        {/* Subtle Footer Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginTop: '20px',
            opacity: footerSpring,
          }}
        >
          <div
            style={{
              height: '1px',
              width: '80px',
              backgroundColor: `${theme.primaryColor}40`,
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: 500,
              color: theme.textMutedColor,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {footerText || 'Compassionate Care at Every Step'}
          </span>
          <div
            style={{
              height: '1px',
              width: '80px',
              backgroundColor: `${theme.primaryColor}40`,
            }}
          />
        </div>
      </div>
    </SlideWrapper>
  );
};
