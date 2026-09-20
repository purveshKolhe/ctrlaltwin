import React from 'react';
import {
  AbsoluteFill,
  Audio,
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
 * Zero layout thrashing, operates exclusively on transforms and opacities.
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

// ============================================================================
// REUSABLE UI PRIMITIVES
// ============================================================================

const HeaderBar: React.FC<{
  slideNumber?: string;
  inverted?: boolean;
}> = ({ slideNumber = '01 / 10', inverted = false }) => {
  const anim = useSpringEntrance(0, 16);

  return (
    <header
      style={{
        ...anim,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '72px 96px 0 96px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: inverted ? '#ffffff' : '#0a1b3f',
          }}
        >
          Borcelle Hospital
        </span>
        <span
          style={{
            fontSize: '16px',
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: inverted ? 'rgba(255, 255, 255, 0.7)' : '#55647e',
          }}
        >
          Care at Every Step
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '16px',
          fontWeight: 500,
          color: inverted ? 'rgba(255, 255, 255, 0.8)' : '#0a1b3f',
        }}
      >
        <span style={{ color: inverted ? 'rgba(255, 255, 255, 0.6)' : '#64748b' }}>
          {slideNumber}
        </span>
      </div>
    </header>
  );
};

const FooterMeta: React.FC<{ inverted?: boolean; footerText?: string }> = ({
  inverted = false,
  footerText = 'Healthcare Presentation',
}) => {
  const anim = useSpringEntrance(18, 14);

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
      <span>Borcelle • 2025</span>
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

  // Animations
  const headerAnim = useSpringEntrance(0, 20);
  const arrowAnim = useSpringEntrance(6, 16);
  const subAnim = useSpringEntrance(12, 24);
  const footAnim = useSpringEntrance(16, 16);

  // Staggered Title Reveals
  const titlePart1 = slide.visual.title.split(' ')[0] || 'Medical';
  const titlePart2 = slide.visual.title.split(' ').slice(1).join(' ') || 'Presentation';

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

  // Subtle floating silk wave animation
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
      {/* Subtle organic silk wave overlay with floating drift */}
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

      {/* Main Content Container */}
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
        {/* Top Header: Brand & Tagline */}
        <div
          style={{
            ...headerAnim,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2
              style={{
                fontSize: '34px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'rgba(255, 255, 255, 0.95)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Borcelle Hospital
            </h2>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 300,
                letterSpacing: '0.02em',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
              }}
            >
              Care at Every Step
            </p>
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
                fontSize: '128px',
                fontWeight: 500,
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                color: '#ffffff',
                margin: 0,
                transform: `translate3d(0, ${t1Y}px, 0)`,
              }}
            >
              {titlePart1}
            </h1>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: '128px',
                fontWeight: 500,
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                transform: `translate3d(0, ${t2Y}px, 0)`,
              }}
            >
              {titlePart2}
            </h1>
          </div>
          <p
            style={{
              ...subAnim,
              marginTop: '32px',
              fontSize: '26px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: '32px 0 0 0',
            }}
          >
            {slide.visual.subtitle || 'Compassionate Care at Every Step'}
          </p>
        </div>

        {/* Footer: Metadata & Category */}
        <div
          style={{
            ...footAnim,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '32px',
            fontSize: '18px',
            letterSpacing: '0.02em',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>Borcelle</span>
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
              }}
            />
            <span>2025</span>
          </div>

          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              {slide.visual.footerText || 'Healthcare Presentation'}
            </span>
          </div>
        </div>
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

  // Subtle Ken Burns slow drift on image
  const imageScale = interpolate(frame, [0, 300], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  const narrative1 =
    slide.visual.bullets?.[0] ||
    slide.narration.script.slice(0, Math.floor(slide.narration.script.length / 2)) ||
    'We are committed to care that centers around your individual needs. From your first consultation to every follow-up, we ensure each service is delivered with attention, safety, and compassion. Your comfort and well-being are always our top concern.';

  const narrative2 =
    slide.visual.bullets?.[1] ||
    slide.narration.script.slice(Math.floor(slide.narration.script.length / 2)) ||
    slide.visual.subtitle ||
    'Our approach is built on trust and personal connection. We take the time to understand your concerns, explain every step clearly, and make sure you feel confident in the care you receive. By placing your needs first, we create a supportive environment.';

  const imageSrc =
    slide.visual.imageUrl ||
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80';

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
      <HeaderBar slideNumber="02 / 10" />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '170px 96px 96px 96px',
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
              fontSize: '82px',
              fontWeight: 300,
              lineHeight: 1.05,
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
              marginTop: '56px',
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

              <div style={{ ...buttonAnim, marginTop: '48px', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                    backgroundColor: '#0a1b3f',
                    color: '#ffffff',
                    fontSize: '17px',
                    fontWeight: 500,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span>Next Page</span>
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
            <img
              src={imageSrc}
              alt={slide.visual.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: `scale(${imageScale})`,
                transition: 'transform 0.1s linear',
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

      <FooterMeta />
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
    label: slide.visual.highlightCard?.title || 'Accuracy',
  };

  const brandCardTitle =
    slide.visual.highlightCard?.text ||
    slide.visual.highlightCard?.subtitle ||
    'Experience Meets Empathy';

  const imageSrc =
    slide.visual.imageUrl ||
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80';

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
      <HeaderBar slideNumber="03 / 10" />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '170px 96px 96px 96px',
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
                  fontWeight: 300,
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
                marginTop: '40px',
                fontSize: '22px',
                lineHeight: 1.7,
                color: '#475569',
                maxWidth: '820px',
                fontWeight: 400,
                margin: '40px 0 0 0',
              }}
            >
              {slide.narration.script ||
                slide.visual.subtitle ||
                'Our team of healthcare experts brings a combination of experience, continuous learning, and genuine care. Through collaboration and up-to-date training, we provide accurate diagnoses and personalized treatment plans.'}
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
                  fontSize: '15px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                }}
              >
                Our Standard
              </span>
              <p
                style={{
                  fontSize: '34px',
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
                  fontSize: '15px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                Reliability
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
            <img
              src={imageSrc}
              alt={slide.visual.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: `scale(${imageScale})`,
                transition: 'transform 0.1s linear',
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

      <FooterMeta />
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 4: PATIENT-CENTERED / DUAL IMAGE STACK (ImageContentSlide)
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
    value: '89%',
    label: 'Satisfaction',
  };

  const image1 =
    slide.visual.imageUrl ||
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80';
  const image2 =
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80';

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
      <HeaderBar slideNumber="04 / 10" />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '170px 96px 96px 96px',
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
                  fontWeight: 300,
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
                marginTop: '40px',
                fontSize: '22px',
                lineHeight: 1.75,
                color: '#475569',
                maxWidth: '800px',
                fontWeight: 400,
                margin: '40px 0 0 0',
              }}
            >
              {slide.narration.script ||
                slide.visual.subtitle ||
                'You are at the heart of every decision we make. We take time to listen, understand your goals, and adjust our care to match your lifestyle. This personalized approach helps build trust and ensures that every step of your journey feels right for you.'}
            </p>
          </div>

          {/* Metric Highlight Card: 89% Satisfaction */}
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
              Feedback Score
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
            <img
              src={image1}
              alt="Consultation"
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
            <img
              src={image2}
              alt="Hands-on care"
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

      <FooterMeta />
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

  const pillars =
    slide.visual.cards && slide.visual.cards.length > 0
      ? slide.visual.cards
      : [
          {
            id: '01',
            title: 'Modern Equipment',
            description:
              slide.visual.bullets?.[0] ||
              'Modern equipment helps deliver quick diagnostic outcomes, reducing waiting time for treatment.',
          },
          {
            id: '02',
            title: 'Advanced Precision',
            description:
              slide.visual.bullets?.[1] ||
              'Advanced tools provide precise data that lead to more effective and personalized care plans.',
          },
          {
            id: '03',
            title: 'Early Intervention',
            description:
              slide.visual.bullets?.[2] ||
              'Timely identification of potential issues allows for earlier intervention and better health outcomes.',
          },
        ];

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
      <HeaderBar slideNumber="05 / 10" />

      <main
        style={{
          width: '100%',
          height: '100%',
          padding: '170px 96px 96px 96px',
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
              fontWeight: 300,
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
          {pillars.slice(0, 3).map((pillar, idx) => {
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
                <p
                  style={{
                    fontSize: '24px',
                    lineHeight: 1.65,
                    fontWeight: 400,
                    color: '#334155',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                >
                  {pillar.description || (pillar as any).text}
                </p>

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
                  Phase 0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <FooterMeta />
    </AbsoluteFill>
  );
};

// ============================================================================
// SLIDE 10: OUTRO / THANK YOU SLIDE (Deep Silk Navy Bookend)
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
            alignItems: 'flex-start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2
              style={{
                fontSize: '34px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'rgba(255, 255, 255, 0.95)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Borcelle Hospital
            </h2>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 300,
                letterSpacing: '0.02em',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
              }}
            >
              Care at Every Step
            </p>
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
                fontSize: '128px',
                fontWeight: 500,
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                color: '#ffffff',
                margin: 0,
                transform: `translate3d(0, ${t1Y}px, 0)`,
              }}
            >
              Thank
            </h1>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h1
              style={{
                fontSize: '128px',
                fontWeight: 500,
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                transform: `translate3d(0, ${t2Y}px, 0)`,
              }}
            >
              You
            </h1>
          </div>
          <p
            style={{
              ...subAnim,
              marginTop: '32px',
              fontSize: '26px',
              fontWeight: 400,
              letterSpacing: '0.02em',
              color: 'rgba(255, 255, 255, 0.75)',
              margin: '32px 0 0 0',
            }}
          >
            {slide.visual.subtitle || 'Compassionate Care at Every Step'}
          </p>
        </div>

        <div
          style={{
            ...footAnim,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '32px',
            fontSize: '18px',
            letterSpacing: '0.02em',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>Borcelle</span>
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
              }}
            />
            <span>2025</span>
          </div>

          <div>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
              {slide.visual.footerText || 'Healthcare Presentation'}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN DISPATCHER COMPONENT (Healthcare Borcelle Template)
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
