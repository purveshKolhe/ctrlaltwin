import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface ImageSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const ImageSlide: React.FC<ImageSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, bullets = [], imageUrl } = slide.visual;

  const leftSpring = spring({ frame, fps, config: { damping: 14 } });
  const rightSpring = spring({ frame: frame - 10, fps, config: { damping: 14 } });

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath}>
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          gap: '80px',
        }}
      >
        {/* Left Column: Text & Bullets */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            opacity: leftSpring,
            transform: `translateX(${interpolate(leftSpring, [0, 1], [-30, 0])}px)`,
          }}
        >
          <h2
            style={{
              fontSize: '52px',
              fontWeight: 800,
              margin: '0 0 16px 0',
              letterSpacing: '-0.02em',
              color: theme.textColor,
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                fontSize: '26px',
                color: theme.textMutedColor,
                margin: '0 0 32px 0',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}

          {bullets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: theme.primaryColor,
                      marginTop: '12px',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '24px',
                      color: theme.textColor,
                      lineHeight: 1.4,
                    }}
                  >
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Visual / Image */}
        <div
          style={{
            flex: 1,
            height: '100%',
            maxHeight: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: rightSpring,
            transform: `scale(${interpolate(rightSpring, [0, 1], [0.9, 1])})`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              overflow: 'hidden',
              border: `2px solid ${theme.primaryColor}40`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.4)`,
              backgroundColor: theme.surfaceColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageUrl ? (
              <Img
                src={imageUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                  color: theme.textMutedColor,
                  padding: '40px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    backgroundColor: `${theme.primaryColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.primaryColor,
                    fontSize: '36px',
                  }}
                >
                  🖼️
                </div>
                <span style={{ fontSize: '20px', fontWeight: 500 }}>
                  {slide.visual.imagePrompt || 'Visual Asset'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
};
