import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { SlideWrapper } from './SlideWrapper';

interface ChartSlideProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const ChartSlide: React.FC<ChartSlideProps> = ({ slide, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, subtitle, chartData = [], metrics = [] } = slide.visual;

  const headerSpring = spring({ frame, fps, config: { damping: 22, mass: 0.8 } });
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <SlideWrapper theme={theme} audioPath={slide.narration.audioPath} freezeFrame={45}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Slide Header */}
        <div>
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
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Big Metric Callouts (Directly modeled on Borcelle Hospital 98% Accuracy style) */}
        {metrics.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
              gap: '32px',
              margin: '36px 0',
            }}
          >
            {metrics.map((metric, idx) => {
              const cardSpring = spring({
                frame: frame - (8 + idx * 6),
                fps,
                config: { damping: 20, mass: 0.85 },
              });

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: theme.surfaceColor,
                    border: `1px solid ${theme.primaryColor}25`,
                    borderRadius: '24px',
                    padding: '38px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    opacity: cardSpring,
                    transform: `translateY(${interpolate(cardSpring, [0, 1], [25, 0])}px)`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '76px',
                      fontWeight: 900,
                      letterSpacing: '-0.04em',
                      color: theme.primaryColor,
                      lineHeight: 1.1,
                      marginBottom: '14px',
                    }}
                  >
                    {metric.value}
                  </span>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      color: theme.textColor,
                      letterSpacing: '-0.01em',
                      marginBottom: '6px',
                    }}
                  >
                    {metric.label}
                  </span>
                  {metric.subtext && (
                    <span
                      style={{
                        fontSize: '18px',
                        color: theme.textMutedColor,
                      }}
                    >
                      {metric.subtext}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Animated Bar Chart */}
        {chartData.length > 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: '40px 60px 24px 60px',
              backgroundColor: theme.surfaceColor,
              borderRadius: '24px',
              border: `1px solid ${theme.primaryColor}20`,
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              maxHeight: '400px',
              boxSizing: 'border-box',
              gap: '48px',
            }}
          >
            {chartData.map((item, idx) => {
              const barSpring = spring({
                frame: frame - (10 + idx * 6),
                fps,
                config: { damping: 20, mass: 0.85, stiffness: 85 },
              });

              const targetHeightPercent = (item.value / maxChartValue) * 100;
              const animatedHeight = interpolate(barSpring, [0, 1], [0, targetHeightPercent]);
              const barColor = item.color || (idx % 2 === 0 ? theme.primaryColor : theme.secondaryColor);

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  {/* Value Label */}
                  <span
                    style={{
                      fontSize: '30px',
                      fontWeight: 800,
                      color: theme.textColor,
                      marginBottom: '14px',
                      letterSpacing: '-0.02em',
                      opacity: barSpring,
                    }}
                  >
                    {Math.round(item.value * barSpring)}
                  </span>

                  {/* Clean Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '130px',
                      height: `${animatedHeight}%`,
                      backgroundColor: barColor,
                      borderRadius: '16px 16px 0 0',
                    }}
                  />

                  {/* Category Label */}
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      color: theme.textMutedColor,
                      marginTop: '18px',
                      textAlign: 'center',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SlideWrapper>
  );
};
