import React from 'react';
import { Audio, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ThemeConfig } from '../../../types/presentation';

interface SlideWrapperProps {
  theme: ThemeConfig;
  audioPath?: string;
  children: React.ReactNode;
}

export const SlideWrapper: React.FC<SlideWrapperProps> = ({
  theme,
  audioPath,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth entrance transition (spring scale & opacity)
  const entrance = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 80,
    },
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(entrance, [0, 1], [0.96, 1]);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily || 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '80px 120px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* Ambient background glow / subtle gradient */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.primaryColor}15 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.secondaryColor}15 0%, transparent 70%)`,
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Slide Content */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Synchronized voiceover audio */}
      {audioPath && <Audio src={audioPath} />}
    </div>
  );
};
