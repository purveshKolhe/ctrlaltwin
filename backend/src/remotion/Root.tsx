import React from 'react';
import { Composition } from 'remotion';
import { PresentationManifest } from '../types/presentation';
import { Presentation } from './Presentation';
import { DEFAULT_THEME } from './themes';

// Default mock presentation manifest for Remotion Studio preview & testing
export const sampleManifest: PresentationManifest = {
  id: 'demo-sample-01',
  topic: 'Artificial Intelligence & The Future of Work',
  title: 'AI in the Modern Enterprise',
  templateId: 'tech-modern-dark',
  theme: DEFAULT_THEME,
  fps: 30,
  width: 1920,
  height: 1080,
  totalDurationInFrames: 600, // 20 seconds total preview
  slides: [
    {
      id: 'slide-1',
      type: 'title',
      visual: {
        title: 'AI in the Modern Enterprise',
        subtitle: 'Unlocking Autonomous Productivity & Decision Intelligence',
        badge: 'Executive Briefing 2026',
      },
      narration: {
        script:
          'Welcome to this briefing on Artificial Intelligence in the Modern Enterprise. Today, we examine how autonomous systems are transforming enterprise workflows.',
        durationSeconds: 5,
        durationInFrames: 150,
      },
    },
    {
      id: 'slide-2',
      type: 'bullet-list',
      visual: {
        title: 'Strategic Pillars of Transformation',
        subtitle: 'Key domains where AI creates immediate operational leverage',
        bullets: [
          'Autonomous Agent Workflows replacing manual repetitive processes',
          'Real-time predictive analytics augmenting leadership decision cycles',
          'Context-aware developer tooling accelerating software shipping velocity',
        ],
      },
      narration: {
        script:
          'There are three primary strategic pillars: autonomous agent workflows, predictive analytics for decision support, and accelerated software velocity.',
        durationSeconds: 5,
        durationInFrames: 150,
      },
    },
    {
      id: 'slide-3',
      type: 'stat-chart',
      visual: {
        title: 'Productivity Multiplication',
        subtitle: 'Observed engineering velocity gains across key enterprise sectors',
        metrics: [
          { label: 'Time Saved / Week', value: '14.5 hrs', subtext: 'Per engineer' },
          { label: 'Cycle Time Reduction', value: '42%', subtext: 'PR review to deploy' },
        ],
        chartData: [
          { label: 'Traditional', value: 35, color: '#64748b' },
          { label: 'Assisted', value: 68, color: '#818cf8' },
          { label: 'Autonomous', value: 95, color: '#38bdf8' },
        ],
      },
      narration: {
        script:
          'Engineering teams report saving over fourteen hours each week, while overall cycle times have dropped by forty-two percent.',
        durationSeconds: 5,
        durationInFrames: 150,
      },
    },
    {
      id: 'slide-4',
      type: 'image-content',
      visual: {
        title: 'Autonomous System Architecture',
        subtitle: 'Decoupled agents communicating over verified event streams',
        bullets: [
          'Orchestrator coordinates intent and delegates subtasks',
          'Domain specialists execute bounded tasks with tool access',
          'Deterministic verification ensures compliance and safety',
        ],
        imagePrompt: 'Cybernetic neural network connecting modular distributed server nodes in neon cyan',
      },
      narration: {
        script:
          'Our architecture relies on decoupled, specialized agents communicating over verified event streams, governed by deterministic safeguards.',
        durationSeconds: 5,
        durationInFrames: 150,
      },
    },
  ],
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MainPresentation"
        component={Presentation}
        durationInFrames={sampleManifest.totalDurationInFrames || 600}
        fps={sampleManifest.fps || 30}
        width={sampleManifest.width || 1920}
        height={sampleManifest.height || 1080}
        defaultProps={{
          manifest: sampleManifest,
        }}
        calculateMetadata={async ({ props }) => {
          const fps = props.manifest.fps || 30;
          const totalDuration = props.manifest.slides.reduce((acc, slide) => {
            const slideFrames =
              slide.narration.durationInFrames ||
              (slide.narration.durationSeconds
                ? Math.ceil(slide.narration.durationSeconds * fps)
                : 150);
            return acc + slideFrames;
          }, 0);

          return {
            durationInFrames: Math.max(totalDuration, 30),
            fps,
            width: props.manifest.width || 1920,
            height: props.manifest.height || 1080,
          };
        }}
      />
    </>
  );
};
