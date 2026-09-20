import React from 'react';
import { SlideData, ThemeConfig } from '../../../types/presentation';
import { BulletSlide } from './BulletSlide';
import { CardGridSlide } from './CardGridSlide';
import { ChartSlide } from './ChartSlide';
import { ConclusionSlide } from './ConclusionSlide';
import { ImageSlide } from './ImageSlide';
import { QuoteSlide } from './QuoteSlide';
import { TitleSlide } from './TitleSlide';
import { TwoColumnSlide } from './TwoColumnSlide';

interface SlideRendererProps {
  slide: SlideData;
  theme: ThemeConfig;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({ slide, theme }) => {
  switch (slide.type) {
    case 'title':
      return <TitleSlide slide={slide} theme={theme} />;
    case 'two-column':
      return <TwoColumnSlide slide={slide} theme={theme} />;
    case 'card-grid':
      return <CardGridSlide slide={slide} theme={theme} />;
    case 'bullet-list':
      return <BulletSlide slide={slide} theme={theme} />;
    case 'stat-chart':
      return <ChartSlide slide={slide} theme={theme} />;
    case 'image-content':
      return <ImageSlide slide={slide} theme={theme} />;
    case 'quote':
      return <QuoteSlide slide={slide} theme={theme} />;
    case 'conclusion':
      return <ConclusionSlide slide={slide} theme={theme} />;
    default:
      return <BulletSlide slide={slide} theme={theme} />;
  }
};
