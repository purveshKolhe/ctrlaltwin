import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SlideData, ThemeConfig } from '../../../types/presentation';

// ============================================================================
// ANIMATION HOOKS & HELPERS (Apple-Grade Keynote Springs)
// ============================================================================

/**
 * Critically damped Apple-style spring entrance helper.
 * Operates on GPU-accelerated transforms and opacities.
 */
const useSpringEntrance = (delayFrames: number = 0, distance: number = 28) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delayFrames,
    fps,
    config: {
      damping: 20,
      mass: 0.8,
      stiffness: 110,
    },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(progress, [0, 1], [distance, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.96, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return {
    opacity,
    transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
  };
};

/**
 * Animated pop for large metrics / numbers
 */
const useMetricPop = (delayFrames: number = 10) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delayFrames,
    fps,
    config: {
      damping: 14,
      mass: 0.7,
      stiffness: 130,
    },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(progress, [0, 1], [0.75, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return {
    opacity,
    transform: `scale(${scale})`,
  };
};

const FALLBACK_IMAGE_DATA_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200" viewBox="0 0 800 1200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23091736"/><stop offset="50%" stop-color="%230d276b"/><stop offset="100%" stop-color="%23050d24"/></linearGradient></defs><rect width="800" height="1200" fill="url(%23g)"/><circle cx="400" cy="500" r="180" fill="%230284c7" opacity="0.3"/><rect x="100" y="800" width="600" height="14" rx="7" fill="%23ffffff" opacity="0.2"/><rect x="100" y="840" width="400" height="14" rx="7" fill="%23ffffff" opacity="0.15"/></svg>';

// ============================================================================
// REUSABLE UI PRIMITIVES
// ============================================================================

const HeaderBar: React.FC<{
  badge?: string;
  inverted?: boolean;
}> = ({ badge, inverted = false }) => {
  const anim = useSpringEntrance(0, 16);

  if (!badge) return null;

  return (
    <header
      style={{
        ...anim,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '64px 96px 0 96px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            padding: '6px 16px',
            borderRadius: '9999px',
            backgroundColor: inverted ? 'rgba(255, 255, 255, 0.12)' : 'rgba(13, 39, 107, 0.08)',
            border: inverted ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(13, 39, 107, 0.15)',
            color: inverted ? '#ffffff' : '#0d276b',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {badge}
        </div>
      </div>
    </header>
  );
};

const FooterMeta: React.FC<{ inverted?: boolean; footerText?: string }> = ({
  inverted = false,
  footerText,
}) => {
  const anim = useSpringEntrance(18, 14);

  if (!footerText) return null;

  return (
    <footer
      style={{
        ...anim,
        position: 'absolute',
        bottom: '24px',
        left: '96px',
        right: '96px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '15px',
        color: inverted ? 'rgba(255, 255, 255, 0.6)' : '#94a3b8',
        borderTop: inverted ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
        paddingTop: inverted ? '24px' : '0',
      }}
    >
      <span>{footerText}</span>
    </footer>
  );
};

// ============================================================================
// SLIDE 1: COVER / TITLE SLIDE (Deep Royal Silk Gradient + Wave)
// ============================================================================

export const TitleSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerAnim = useSpringEntrance(0, 20);
  const arrowAnim = useSpringEntrance(6, 16);
  const subAnim = useSpringEntrance(12, 24);
  const footAnim = useSpringEntrance(16, 16);

  // Split title intelligently across lines if multi-word
  const words = slide.visual.title.trim().split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  const line1 = words.length > 1 ? words.slice(0, mid).join(' ') : words[0] || 'Presentation';
  const line2 = words.length > 1 ? words.slice(mid).join(' ') : '';

  const t1Progress = spring({
    frame: frame - 4,
    fps,
    config: { damping: 22, mass: 0.8, stiffness: 110 },
  });
  const t2Progress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 22, mass: 0.8, stiffness: 110 },
  });

  const t1Y = interpolate(t1Progress, [0, 1], [120, 0], { extrapolateRight: 'clamp' });
  const t2Y = interpolate(t2Progress, [0, 1], [120, 0], { extrapolateRight: 'clamp' });

  // Floating silk wave animation
  const waveDrift = interpolate(frame, [0, 300], [0, 40], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#ffffff',
        background: `
          radial-gradient(ellipse 70% 80% at 20% 40%, rgba(20, 60, 160, 0.85) 0%, transparent 70%),
          radial-gradient(ellipse 60% 60% at 85% 65%, rgba(10, 35, 110, 0.9) 0%, transparent 70%),
          radial-gradient(ellipse 90% 90% at 50% 90%, rgba(5, 18, 55, 0.95) 0%, transparent 80%),
          linear-gradient(135deg, #091736 0%, #0d276b 35%, #081a4a 65%, #050d24 100%)
        `,
      }}
    >
      {/* Organic silk wave overlay */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.35,
          transform: `translate3d(${waveDrift}px, 0, 0)`,
        }}
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-200,600 C300,450 700,900 1300,550 C1700,300 1950,500 2200,400"
          stroke="url(#silkGlow)"
          strokeWidth="320"
          strokeLinecap="round"
          filter="blur(80px)"
        />
        <defs>
          <linearGradient id="silkGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b66d6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#1240a8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a205a" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '96px',
          boxSizing: 'border-box',
        }}
      >
        {/* Top Header: Dynamic Category Badge & Minimalist Arrow */}
        <div
          style={{
            ...headerAnim,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {slide.visual.badge && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                }}
              >
                {slide.visual.badge}
              </div>
            )}
          </div>

          <div
            style={{
              ...arrowAnim,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1, marginBottom: '2px' }}>→</span>
          </div>
        </div>

        {/* Center: Main Title Block with Masked Reveals */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-32px' }}>
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: line2 ? '110px' : '124px',
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.0,
                color: '#ffffff',
                margin: 0,
                transform: `translate3d(0, ${t1Y}px, 0)`,
              }}
            >
              {line1}
            </h1>
          </div>
          {line2 && (
            <div style={{ overflow: 'hidden', marginTop: '8px' }}>
              <h1
                style={{
                  fontSize: '110px',
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.0,
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  transform: `translate3d(0, ${t2Y}px, 0)`,
                }}
              >
                {line2}
              </h1>
            </div>
          )}
          {slide.visual.subtitle && (
            <p
              style={{
                ...subAnim,
                marginTop: '36px',
                fontSize: '26px',
                fontWeight: 400,
                letterSpacing: '0.01em',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '36px 0 0 0',
                maxWidth: '900px',
                lineHeight: 1.4,
              }}
            >
              {slide.visual.subtitle}
            </p>
          )}
        </div>

        {/* Footer */}
        {slide.visual.footerText ? (
          <div
            style={{
              ...footAnim,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '28px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <span>{slide.visual.footerText}</span>
          </div>
        ) : (
          <div style={{ height: '24px' }} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 2: TWO-COLUMN EDITORIAL (Narrative + Tall Portrait Image Card)
// ============================================================================

export const TwoColumnSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
}) => {
  const frame = useCurrentFrame();

  const titleAnim = useSpringEntrance(3, 32);
  const col1Anim = useSpringEntrance(8, 24);
  const col2Anim = useSpringEntrance(12, 24);
  const buttonAnim = useSpringEntrance(16, 16);
  const imageCardAnim = useSpringEntrance(6, 40);

  const imageScale = interpolate(frame, [0, 300], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  const narrative1 =
    slide.visual.bullets?.[0] ||
    slide.narration.script.slice(0, Math.floor(slide.narration.script.length / 2)) ||
    slide.visual.subtitle ||
    'Comprehensive examination of core concepts, system architecture, and strategic objectives designed for scalable execution.';

  const narrative2 =
    slide.visual.bullets?.[1] ||
    slide.narration.script.slice(Math.floor(slide.narration.script.length / 2)) ||
    'Our methodology emphasizes reliability, precision, and measurable performance at every layer of implementation.';

  const imageSrc = slide.visual.imageUrl || FALLBACK_IMAGE_DATA_URI;

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f7f9fc',
        color: '#0f172a',
      }}
    >
      <HeaderBar badge={slide.visual.badge} />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '160px 96px 80px 96px',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          columnGap: '64px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Section: 7 Columns */}
        <div
          style={{
            gridColumn: 'span 7 / span 7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: '24px',
          }}
        >
          <h1
            style={{
              ...titleAnim,
              fontSize: '76px',
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#0a1b3f',
              margin: 0,
            }}
          >
            {slide.visual.title.includes(',') ? (
              <>
                {slide.visual.title.split(',')[0]}, <br />
                <span style={{ fontWeight: 600, color: '#0d276b' }}>
                  {slide.visual.title.split(',')[1]}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 600, color: '#0d276b' }}>
                {slide.visual.title}
              </span>
            )}
          </h1>

          <div
            style={{
              marginTop: '48px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '40px',
              fontSize: '20px',
              lineHeight: 1.65,
              color: '#334155',
            }}
          >
            <div
              style={{
                ...col1Anim,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <p style={{ margin: 0, fontWeight: 400 }}>{narrative1}</p>

              <div style={{ ...buttonAnim, marginTop: '40px', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    backgroundColor: '#0a1b3f',
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: 500,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <span>Explore Further</span>
                  <span style={{ fontSize: '18px' }}>→</span>
                </div>
              </div>
            </div>

            <div style={{ ...col2Anim, display: 'flex', flexDirection: 'column' }}>
              <p style={{ margin: 0, fontWeight: 400, color: '#475569' }}>
                {narrative2}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: 5 Columns Tall Portrait Image Card */}
        <div
          style={{
            ...imageCardAnim,
            gridColumn: 'span 5 / span 5',
            height: '760px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '36px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
              border: '1px solid #e2e8f0',
              backgroundColor: '#e2e8f0',
              position: 'relative',
            }}
          >
            <Img
              src={imageSrc}
              alt={slide.visual.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: `scale(${imageScale})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '36px',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </main>

      <FooterMeta footerText={slide.visual.footerText} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 3: STAT HIGHLIGHT (Metric Card + Brand Card + Tall Image)
// ============================================================================

export const StatHighlightSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
}) => {
  const frame = useCurrentFrame();

  const titleAnim = useSpringEntrance(3, 28);
  const narrativeAnim = useSpringEntrance(7, 24);
  const brandCardAnim = useSpringEntrance(11, 24);
  const metricCardAnim = useSpringEntrance(14, 24);
  const metricPopAnim = useMetricPop(16);
  const imageAnim = useSpringEntrance(6, 36);

  const imageScale = interpolate(frame, [0, 300], [1, 1.04], {
    extrapolateRight: 'clamp',
  });

  const mainMetric = slide.visual.metrics?.[0] || {
    value: slide.visual.highlightCard?.stat || '98%',
    label: slide.visual.highlightCard?.title || 'System Accuracy',
  };

  const brandCardTitle =
    slide.visual.highlightCard?.text ||
    slide.visual.highlightCard?.subtitle ||
    slide.visual.badge ||
    'Proven Reliability & Scale';

  const imageSrc = slide.visual.imageUrl || FALLBACK_IMAGE_DATA_URI;

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f7f9fc',
        color: '#0f172a',
      }}
    >
      <HeaderBar badge={slide.visual.badge} />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '160px 96px 80px 96px',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          columnGap: '64px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Section: 7 Columns */}
        <div
          style={{
            gridColumn: 'span 7 / span 7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '740px',
            paddingRight: '16px',
          }}
        >
          <div>
            <div
              style={{
                ...titleAnim,
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <h1
                style={{
                  fontSize: '76px',
                  fontWeight: 400,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: '#0a1b3f',
                  margin: 0,
                }}
              >
                {slide.visual.title.includes(' ') ? (
                  <>
                    {slide.visual.title.split(' ')[0]} <br />
                    <span style={{ fontWeight: 600, color: '#0d276b' }}>
                      {slide.visual.title.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <span style={{ fontWeight: 600, color: '#0d276b' }}>
                    {slide.visual.title}
                  </span>
                )}
              </h1>
              <span
                style={{
                  fontSize: '52px',
                  fontWeight: 300,
                  color: '#0a1b3f',
                  alignSelf: 'flex-end',
                  marginBottom: '8px',
                }}
              >
                →
              </span>
            </div>

            <p
              style={{
                ...narrativeAnim,
                marginTop: '36px',
                fontSize: '22px',
                lineHeight: 1.7,
                color: '#475569',
                maxWidth: '820px',
                fontWeight: 400,
                margin: '36px 0 0 0',
              }}
            >
              {slide.narration.script ||
                slide.visual.subtitle ||
                'Empowering high-performance workflows through rigorous design, continuous testing, and verified operational benchmarks.'}
            </p>
          </div>

          {/* Bottom Dual Metric & Accent Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '32px',
              paddingTop: '24px',
            }}
          >
            {/* Card 1: Navy Brand Accent Card */}
            <div
              style={{
                ...brandCardAnim,
                borderRadius: '28px',
                backgroundColor: '#0a1b3f',
                color: '#ffffff',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '230px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                }}
              >
                Core Advantage
              </span>
              <p
                style={{
                  fontSize: '32px',
                  fontWeight: 500,
                  lineHeight: 1.15,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                {brandCardTitle}
              </p>
            </div>

            {/* Card 2: Crisp Metric Card */}
            <div
              style={{
                ...metricCardAnim,
                borderRadius: '28px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '230px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                Benchmark
              </span>
              <div>
                <h2
                  style={{
                    ...metricPopAnim,
                    fontSize: '64px',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#0d276b',
                    lineHeight: 1,
                    margin: 0,
                  }}
                >
                  {mainMetric.value}
                </h2>
                <p
                  style={{
                    marginTop: '8px',
                    fontSize: '20px',
                    fontWeight: 500,
                    color: '#334155',
                    margin: '8px 0 0 0',
                  }}
                >
                  {mainMetric.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: 5 Columns Photo Card */}
        <div
          style={{
            ...imageAnim,
            gridColumn: 'span 5 / span 5',
            height: '740px',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '36px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
              border: '1px solid #e2e8f0',
              backgroundColor: '#e2e8f0',
              position: 'relative',
            }}
          >
            <Img
              src={imageSrc}
              alt={slide.visual.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: `scale(${imageScale})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '36px',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </main>

      <FooterMeta footerText={slide.visual.footerText} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 4: DUAL IMAGE STACK (ImageContentSlide)
// ============================================================================

export const ImageContentSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
}) => {
  const frame = useCurrentFrame();

  const titleAnim = useSpringEntrance(3, 28);
  const narrativeAnim = useSpringEntrance(7, 24);
  const metricCardAnim = useSpringEntrance(12, 24);
  const metricPopAnim = useMetricPop(15);
  const img1Anim = useSpringEntrance(6, 32);
  const img2Anim = useSpringEntrance(10, 32);

  const imageScale = interpolate(frame, [0, 300], [1, 1.04], {
    extrapolateRight: 'clamp',
  });

  const mainMetric = slide.visual.metrics?.[0] || {
    value: '94%',
    label: 'Efficiency',
  };

  const image1 = slide.visual.imageUrl || FALLBACK_IMAGE_DATA_URI;
  const image2 = slide.visual.secondaryImageUrl || slide.visual.imageUrl || FALLBACK_IMAGE_DATA_URI;

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f7f9fc',
        color: '#0f172a',
      }}
    >
      <HeaderBar badge={slide.visual.badge} />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '160px 96px 80px 96px',
          display: 'grid',
          gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
          columnGap: '64px',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Section: 7 Columns */}
        <div
          style={{
            gridColumn: 'span 7 / span 7',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '740px',
            paddingRight: '24px',
          }}
        >
          <div>
            <div
              style={{
                ...titleAnim,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <h1
                style={{
                  fontSize: '76px',
                  fontWeight: 400,
                  lineHeight: 1.08,
                  letterSpacing: '-0.03em',
                  color: '#0a1b3f',
                  margin: 0,
                }}
              >
                {slide.visual.title.includes(' ') ? (
                  <>
                    {slide.visual.title.split(' ')[0]} <br />
                    <span style={{ fontWeight: 600, color: '#0d276b' }}>
                      {slide.visual.title.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <span style={{ fontWeight: 600, color: '#0d276b' }}>
                    {slide.visual.title}
                  </span>
                )}
              </h1>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0a1b3f',
                  fontSize: '28px',
                  marginTop: '8px',
                }}
              >
                ↓
              </div>
            </div>

            <p
              style={{
                ...narrativeAnim,
                marginTop: '36px',
                fontSize: '22px',
                lineHeight: 1.75,
                color: '#475569',
                maxWidth: '800px',
                fontWeight: 400,
                margin: '36px 0 0 0',
              }}
            >
              {slide.narration.script ||
                slide.visual.subtitle ||
                'Delivering seamless end-to-end integration designed to maximize output, reduce overhead, and ensure consistent excellence.'}
            </p>
          </div>

          {/* Metric Highlight Card */}
          <div
            style={{
              ...metricCardAnim,
              width: '360px',
              borderRadius: '28px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              Performance Metric
            </span>
            <div style={{ marginTop: '16px' }}>
              <h2
                style={{
                  ...metricPopAnim,
                  fontSize: '64px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#0d276b',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                {mainMetric.value}
              </h2>
              <p
                style={{
                  marginTop: '8px',
                  fontSize: '20px',
                  fontWeight: 500,
                  color: '#334155',
                  margin: '8px 0 0 0',
                }}
              >
                {mainMetric.label}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: 5 Columns Dual Image Stack */}
        <div
          style={{
            gridColumn: 'span 5 / span 5',
            height: '740px',
            display: 'grid',
            gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
            gap: '24px',
          }}
        >
          {/* Top Image */}
          <div
            style={{
              ...img1Anim,
              width: '100%',
              height: '100%',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              backgroundColor: '#e2e8f0',
            }}
          >
            <Img
              src={image1}
              alt="Visual asset"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: `scale(${imageScale})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '30px',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Bottom Image */}
          <div
            style={{
              ...img2Anim,
              width: '100%',
              height: '100%',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              backgroundColor: '#e2e8f0',
            }}
          >
            <Img
              src={image2}
              alt="Detail asset"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: `scale(${imageScale})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '30px',
                boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </main>

      <FooterMeta footerText={slide.visual.footerText} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 5: 3-COLUMN FEATURE CARDS (CardGridSlide / BulletListSlide)
// ============================================================================

export const CardGridSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleAnim = useSpringEntrance(2, 32);

  // Dynamically map cards from slide.visual.cards OR slide.visual.bullets!
  const rawCards =
    slide.visual.cards && slide.visual.cards.length > 0
      ? slide.visual.cards.map((c, i) => ({
          tag: c.tag || `0${i + 1}`,
          title: c.title,
          description: c.description,
        }))
      : slide.visual.bullets && slide.visual.bullets.length > 0
        ? slide.visual.bullets.map((b, i) => ({
            tag: `0${i + 1}`,
            title: `Key Pillar 0${i + 1}`,
            description: b,
          }))
        : [
            {
              tag: '01',
              title: 'Strategic Foundation',
              description: 'Establishing robust architecture and baseline protocols for scalable execution.',
            },
            {
              tag: '02',
              title: 'Automated Operations',
              description: 'Leveraging modern toolchains to accelerate delivery cycles and reduce friction.',
            },
            {
              tag: '03',
              title: 'Continuous Verification',
              description: 'Rigorous monitoring and validation to ensure sustained reliability and quality.',
            },
          ];

  const pillars = rawCards.slice(0, 3);

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        backgroundColor: '#f7f9fc',
        color: '#0f172a',
      }}
    >
      <HeaderBar badge={slide.visual.badge} />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '160px 96px 80px 96px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ maxWidth: '1100px' }}>
          <h1
            style={{
              ...titleAnim,
              fontSize: '76px',
              fontWeight: 400,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#0a1b3f',
              margin: 0,
            }}
          >
            {slide.visual.title.includes(' ') ? (
              <>
                {slide.visual.title.split(' ')[0]} <br />
                <span style={{ fontWeight: 600, color: '#0d276b' }}>
                  {slide.visual.title.split(' ').slice(1).join(' ')}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 600, color: '#0d276b' }}>
                {slide.visual.title}
              </span>
            )}
          </h1>
        </div>

        {/* 3-Column Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '40px',
            marginBottom: '32px',
          }}
        >
          {pillars.map((pillar, idx) => {
            const cardProgress = spring({
              frame: frame - (6 + idx * 6),
              fps,
              config: { damping: 20, mass: 0.8, stiffness: 110 },
            });
            const cardY = interpolate(cardProgress, [0, 1], [48, 0], {
              extrapolateRight: 'clamp',
            });
            const cardOpacity = interpolate(cardProgress, [0, 1], [0, 1], {
              extrapolateRight: 'clamp',
            });
            const iconRotate = interpolate(cardProgress, [0, 1], [-45, 0], {
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={idx}
                style={{
                  borderRadius: '32px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  padding: '48px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '420px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  boxSizing: 'border-box',
                  transform: `translate3d(0, ${cardY}px, 0)`,
                  opacity: cardOpacity,
                }}
              >
                {/* Top Accent Icon */}
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a1b3f',
                    fontSize: '20px',
                    fontWeight: 300,
                    transform: `rotate(${iconRotate}deg)`,
                  }}
                >
                  ✕
                </div>

                {/* Card Copy */}
                <div>
                  {pillar.title && pillar.title !== `Key Pillar 0${idx + 1}` && (
                    <h3
                      style={{
                        fontSize: '26px',
                        fontWeight: 600,
                        color: '#0a1b3f',
                        margin: '0 0 12px 0',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {pillar.title}
                    </h3>
                  )}
                  <p
                    style={{
                      fontSize: '22px',
                      lineHeight: 1.6,
                      fontWeight: 400,
                      color: '#334155',
                      letterSpacing: '-0.01em',
                      margin: 0,
                    }}
                  >
                    {pillar.description}
                  </p>
                </div>

                {/* Bottom Index Accent */}
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                  }}
                >
                  Phase {pillar.tag || `0${idx + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <FooterMeta footerText={slide.visual.footerText} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 10: OUTRO / SUMMARY SLIDE (Deep Silk Navy Bookend)
// ============================================================================

export const ConclusionSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerAnim = useSpringEntrance(0, 20);
  const arrowAnim = useSpringEntrance(6, 16);
  const subAnim = useSpringEntrance(12, 24);
  const footAnim = useSpringEntrance(16, 16);

  const words = slide.visual.title.trim().split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  const line1 = words.length > 1 ? words.slice(0, mid).join(' ') : words[0] || 'Thank';
  const line2 = words.length > 1 ? words.slice(mid).join(' ') : (words[0] === 'Thank' ? 'You' : '');

  const t1Progress = spring({
    frame: frame - 4,
    fps,
    config: { damping: 22, mass: 0.8, stiffness: 110 },
  });
  const t2Progress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 22, mass: 0.8, stiffness: 110 },
  });

  const t1Y = interpolate(t1Progress, [0, 1], [120, 0], { extrapolateRight: 'clamp' });
  const t2Y = interpolate(t2Progress, [0, 1], [120, 0], { extrapolateRight: 'clamp' });

  const waveDrift = interpolate(frame, [0, 300], [0, 40], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#ffffff',
        background: `
          radial-gradient(ellipse 70% 80% at 20% 40%, rgba(20, 60, 160, 0.85) 0%, transparent 70%),
          radial-gradient(ellipse 60% 60% at 85% 65%, rgba(10, 35, 110, 0.9) 0%, transparent 70%),
          radial-gradient(ellipse 90% 90% at 50% 90%, rgba(5, 18, 55, 0.95) 0%, transparent 80%),
          linear-gradient(135deg, #091736 0%, #0d276b 35%, #081a4a 65%, #050d24 100%)
        `,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.35,
          transform: `translate3d(${waveDrift}px, 0, 0)`,
        }}
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-200,600 C300,450 700,900 1300,550 C1700,300 1950,500 2200,400"
          stroke="url(#silkGlowOutro)"
          strokeWidth="320"
          strokeLinecap="round"
          filter="blur(80px)"
        />
        <defs>
          <linearGradient id="silkGlowOutro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2b66d6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#1240a8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0a205a" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '96px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            ...headerAnim,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            {slide.visual.badge && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '15px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#ffffff',
                }}
              >
                {slide.visual.badge}
              </div>
            )}
          </div>

          <div
            style={{
              ...arrowAnim,
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1, marginBottom: '2px' }}>→</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-32px' }}>
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: line2 ? '110px' : '124px',
                fontWeight: 600,
                letterSpacing: '-0.035em',
                lineHeight: 1.0,
                color: '#ffffff',
                margin: 0,
                transform: `translate3d(0, ${t1Y}px, 0)`,
              }}
            >
              {line1}
            </h1>
          </div>
          {line2 && (
            <div style={{ overflow: 'hidden', marginTop: '8px' }}>
              <h1
                style={{
                  fontSize: '110px',
                  fontWeight: 600,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.0,
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  transform: `translate3d(0, ${t2Y}px, 0)`,
                }}
              >
                {line2}
              </h1>
            </div>
          )}
          {slide.visual.subtitle && (
            <p
              style={{
                ...subAnim,
                marginTop: '36px',
                fontSize: '26px',
                fontWeight: 400,
                letterSpacing: '0.01em',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '36px 0 0 0',
                maxWidth: '900px',
                lineHeight: 1.4,
              }}
            >
              {slide.visual.subtitle}
            </p>
          )}
        </div>

        {slide.visual.footerText ? (
          <div
            style={{
              ...footAnim,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '28px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <span>{slide.visual.footerText}</span>
          </div>
        ) : (
          <div style={{ height: '24px' }} />
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN DISPATCHER COMPONENT
// ============================================================================

export const HealthcareSlideRenderer: React.FC<{
  slide: SlideData;
  theme: ThemeConfig;
}> = ({ slide, theme }) => {
  const renderContent = () => {
    switch (slide.type) {
      case 'title':
        return <TitleSlide slide={slide} theme={theme} />;
      case 'two-column':
        return <TwoColumnSlide slide={slide} theme={theme} />;
      case 'card-grid':
      case 'bullet-list':
        return <CardGridSlide slide={slide} theme={theme} />;
      case 'stat-highlight':
      case 'stat-chart':
        return <StatHighlightSlide slide={slide} theme={theme} />;
      case 'image-content':
        return <ImageContentSlide slide={slide} theme={theme} />;
      case 'conclusion':
      case 'quote':
        return <ConclusionSlide slide={slide} theme={theme} />;
      default:
        return <TwoColumnSlide slide={slide} theme={theme} />;
    }
  };

  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {renderContent()}

      {/* Voiceover narration audio track */}
      {slide.narration.audioPath && (
        <Audio src={slide.narration.audioPath} />
      )}
    </AbsoluteFill>
  );
};
