import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface QuoteSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const QuoteSlide: React.FC<QuoteSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { quote, author, title } = slide.visual;

  const quoteSpring = spring({ frame: frame - 4, fps, config: { damping: 22, mass: 0.85 } });
  const authorSpring = spring({ frame: frame - 12, fps, config: { damping: 22, mass: 0.85 } });

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '1350px',
          margin: '0 auto',
        }}
      >
        {/* Subtle decorative quote mark */}
        <span
          style={{
            fontSize: '110px',
            lineHeight: 0.7,
            color: theme.primaryColor,
            opacity: 0.4,
            fontFamily: 'serif',
            marginBottom: '16px',
          }}
        >
          “
        </span>

        {/* Editorial Quote */}
        <blockquote
          style={{
            fontSize: '50px',
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: '-0.03em',
            color: theme.textColor,
            margin: '0 0 40px 0',
            opacity: quoteSpring,
            transform: `translateY(${interpolate(quoteSpring, [0, 1], [25, 0])}px)`,
          }}
        >
          {quote || title}
        </blockquote>

        {/* Author / Source Badge */}
        {author && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              padding: '10px 24px',
              borderRadius: '9999px',
              backgroundColor: `${theme.primaryColor}12`,
              border: `1px solid ${theme.primaryColor}30`,
              opacity: authorSpring,
              transform: `translateY(${interpolate(authorSpring, [0, 1], [20, 0])}px)`,
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontWeight: 600,
                color: theme.primaryColor,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {author}
            </span>
          </div>
        )}
      </div>
    </SlideWrapper>
  );
};
