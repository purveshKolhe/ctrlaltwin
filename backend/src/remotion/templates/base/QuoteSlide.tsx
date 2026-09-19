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

  const quoteSpring = spring({ frame: frame - 5, fps, config: { damping: 14 } });
  const authorSpring = spring({ frame: frame - 18, fps, config: { damping: 14 } });

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
          maxWidth: '1300px',
          margin: '0 auto',
        }}
      >
        {/* Giant Quote Icon */}
        <span
          style={{
            fontSize: '120px',
            lineHeight: 0.8,
            color: theme.primaryColor,
            fontFamily: 'serif',
            opacity: 0.4,
            marginBottom: '20px',
          }}
        >
          “
        </span>

        {/* The Quote Text */}
        <blockquote
          style={{
            fontSize: '46px',
            fontWeight: 600,
            lineHeight: 1.35,
            color: theme.textColor,
            margin: '0 0 40px 0',
            fontStyle: 'italic',
            opacity: quoteSpring,
            transform: `translateY(${interpolate(quoteSpring, [0, 1], [30, 0])}px)`,
          }}
        >
          {quote || title}
        </blockquote>

        {/* Author / Source */}
        {author && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              opacity: authorSpring,
              transform: `translateY(${interpolate(authorSpring, [0, 1], [20, 0])}px)`,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '2px',
                backgroundColor: theme.primaryColor,
              }}
            />
            <span
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: theme.primaryColor,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {author}
            </span>
            <div
              style={{
                width: '40px',
                height: '2px',
                backgroundColor: theme.primaryColor,
              }}
            />
          </div>
        )}
      </div>
    </SlideWrapper>
  );
};
