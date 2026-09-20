import React from 'react';
import { Audio, Freeze, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeConfig } from '../../../types/presentation';

interface SlideWrapperProps {
  theme: ThemeConfig;
  audioPath?: string;
  freezeFrame?: number;
  children: React.ReactNode;
}

// Default fallback freeze frame if not specified
const DEFAULT_ANIMATION_FREEZE_FRAME = 45;

export const SlideWrapper: React.FC<SlideWrapperProps> = ({
  theme,
  audioPath,
  freezeFrame = DEFAULT_ANIMATION_FREEZE_FRAME,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Apple-style sleek spring (critically damped, zero bounce)
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 24,
      mass: 0.8,
      stiffness: 90,
    },
  });

  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(entrance, [0, 1], [0.97, 1]);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily:
          theme.fontFamily ||
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '90px 140px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Visual Content (Frozen after freezeFrame to save massive rendering time) */}
      <Freeze frame={Math.min(frame, freezeFrame)}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1,
            transform: `scale(${scale})`,
            opacity,
          }}
        >
          {/* Subtle gradient accent shapes (pure CSS gradients without expensive blur filters) */}
          <div
            style={{
              position: 'absolute',
              top: '-15%',
              right: '-10%',
              width: '700px',
              height: '700px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.primaryColor}12 0%, transparent 65%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-15%',
              left: '-10%',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.secondaryColor}10 0%, transparent 65%)`,
              pointerEvents: 'none',
            }}
          />

          {children}
        </div>
      </Freeze>

      {/* Voiceover audio runs continuously outside of the frozen visual tree */}
      {audioPath && <Audio src={audioPath} />}
    </div>
  );
};
