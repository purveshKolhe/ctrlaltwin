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

  const headerSpring = spring({ frame, fps, config: { damping: 14 } });

  // Calculate maximum value for chart scaling
  const maxChartValue = Math.max(...chartData.map((d) => d.value), 1);

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
        <div>
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

        {/* Metric Cards (if present) */}
        {metrics.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
              gap: '32px',
              margin: '40px 0',
            }}
          >
            {metrics.map((metric, idx) => {
              const cardSpring = spring({
                frame: frame - (15 + idx * 10),
                fps,
                config: { damping: 14 },
              });

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: theme.surfaceColor,
                    border: `1px solid ${theme.primaryColor}30`,
                    borderRadius: '20px',
                    padding: '36px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    opacity: cardSpring,
                    transform: `translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
                  }}
                >
                  <span
                    style={{
                      fontSize: '64px',
                      fontWeight: 800,
                      color: theme.primaryColor,
                      lineHeight: 1.1,
                      marginBottom: '12px',
                    }}
                  >
                    {metric.value}
                  </span>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 600,
                      color: theme.textColor,
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

        {/* Animated Bar Chart (if present) */}
        {chartData.length > 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              padding: '40px 60px 20px 60px',
              backgroundColor: theme.surfaceColor,
              borderRadius: '24px',
              border: `1px solid ${theme.primaryColor}20`,
              maxHeight: '420px',
              boxSizing: 'border-box',
              gap: '40px',
            }}
          >
            {chartData.map((item, idx) => {
              const barSpring = spring({
                frame: frame - (20 + idx * 10),
                fps,
                config: { damping: 15, stiffness: 80 },
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
                  {/* Animated Value Label */}
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: theme.textColor,
                      marginBottom: '12px',
                      opacity: barSpring,
                    }}
                  >
                    {Math.round(item.value * barSpring)}
                  </span>

                  {/* The Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '120px',
                      height: `${animatedHeight}%`,
                      backgroundColor: barColor,
                      borderRadius: '12px 12px 0 0',
                      boxShadow: `0 0 20px ${barColor}40`,
                    }}
                  />

                  {/* The Label */}
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      color: theme.textMutedColor,
                      marginTop: '16px',
                      textAlign: 'center',
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
