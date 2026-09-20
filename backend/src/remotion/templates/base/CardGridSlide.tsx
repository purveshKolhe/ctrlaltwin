import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface CardGridSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const CardGridSlide: React.FC<CardGridSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, badge, cards = [] } = slide.visual;

  // Header spring
  const headerSpring = spring({ frame: frame - 2, fps, config: { damping: 22, mass: 0.8 } });
  const headerY = interpolate(headerSpring, [0, 1], [25, 0]);

  // If no cards provided in visual, generate fallback cards from bullets or default
  const displayCards: Array<{ title: string; description: string; tag?: string }> =
    cards.length > 0
      ? cards
      : (slide.visual.bullets || []).map((b, i) => ({
          title: `Pillar 0${i + 1}`,
          description: b,
          tag: undefined,
        }));

  const maxFreeze = Math.min(70, Math.max(50, 15 + displayCards.length * 10 + 20));

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath} freezeFrame={maxFreeze}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Header Section (Canva Borcelle PDF p. 5 & 9 style) */}
        <div style={{ opacity: headerSpring, transform: `translateY(${headerY}px)` }}>
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
                marginBottom: '16px',
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
              fontSize: '52px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: theme.textColor,
              margin: '0 0 12px 0',
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                fontSize: '24px',
                color: theme.textMutedColor,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Horizontal 3-4 Card Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '28px',
            width: '100%',
            alignItems: 'stretch',
            marginTop: '36px',
            flex: 1,
            maxHeight: '480px',
          }}
        >
          {displayCards.slice(0, 4).map((card, idx) => {
            const cardDelay = 8 + idx * 10;
            const cardSpring = spring({
              frame: frame - cardDelay,
              fps,
              config: { damping: 20, mass: 0.8, stiffness: 95 },
            });
            const cardY = interpolate(cardSpring, [0, 1], [35, 0]);

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  backgroundColor: theme.surfaceColor,
                  border: `1px solid ${theme.primaryColor}25`,
                  borderRadius: '24px',
                  padding: '36px 32px',
                  boxShadow: '0 12px 32px -8px rgba(2, 132, 199, 0.07), 0 4px 14px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  position: 'relative',
                  opacity: cardSpring,
                  transform: `translateY(${cardY}px)`,
                }}
              >
                {/* Number / Tag Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: `${theme.primaryColor}15`,
                      border: `1px solid ${theme.primaryColor}35`,
                      color: theme.primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                    }}
                  >
                    {idx + 1}
                  </div>
                  {card.tag && (
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: theme.secondaryColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {card.tag}
                    </span>
                  )}
                </div>

                {/* Card Title */}
                <h3
                  style={{
                    fontSize: '26px',
                    fontWeight: 700,
                    color: theme.textColor,
                    margin: '0 0 16px 0',
                    lineHeight: 1.3,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {card.title}
                </h3>

                {/* Card Description */}
                <p
                  style={{
                    fontSize: '20px',
                    lineHeight: 1.55,
                    color: theme.textMutedColor,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SlideWrapper>
  );
};
