import React from 'react';
import { Series } from 'remotion';
import { RemotionPresentationProps } from '../types/presentation';
import { SlideRenderer } from './templates/base/SlideRenderer';
import { getTheme } from './themes';

export const Presentation: React.FC<RemotionPresentationProps> = ({ manifest }) => {
  const theme = manifest.theme || getTheme(manifest.templateId);
  const fps = manifest.fps || 30;

  return (
    <div style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
      <Series>
        {manifest.slides.map((slide) => {
          // Duration driven by narration audio, with a fallback of 5 seconds (150 frames @ 30fps)
          const duration =
            slide.narration.durationInFrames ||
            (slide.narration.durationSeconds
              ? Math.ceil(slide.narration.durationSeconds * fps)
              : 150);

          return (
            <Series.Sequence key={slide.id} durationInFrames={duration}>
              <SlideRenderer slide={slide} theme={theme} />
            </Series.Sequence>
          );
        })}
      </Series>
    </div>
  );
};
