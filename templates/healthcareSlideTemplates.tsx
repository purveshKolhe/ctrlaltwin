import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ============================================================================
// DATA SCHEMAS & THEME
// ============================================================================

export interface SlideData {
  id: string;
  type: 'title' | 'two-column' | 'card-grid' | 'stat-highlight' | 'bullet-list' | 'conclusion';
  visual: {
    title: string;
    subtitle?: string;
    badge?: string;
    bullets?: string[];
    cards?: Array<{ title: string; description: string; tag?: string }>;
    highlightCard?: { title: string; subtitle?: string; stat?: string; text?: string };
    metrics?: Array<{ label: string; value: string; subtext?: string }>;
    footerText?: string;
  };
  narration: {
    script: string;
    audioPath?: string;
  };
}

export interface ThemeConfig {
  backgroundColor: string; // '#f8fafc'
  surfaceColor: string;    // '#ffffff'
  primaryColor: string;    // '#0284c7'
  secondaryColor: string;  // '#0d9488'
  textColor: string;       // '#0f172a'
  textMutedColor: string;  // '#475569'
  accentColor: string;     // '#2563eb'
  fontFamily?: string;
}

const DEFAULT_THEME: ThemeConfig = {
  backgroundColor: '#f1f5f9',
  surfaceColor: '#ffffff',
  primaryColor: '#0284c7',
  secondaryColor: '#0d9488',
  textColor: '#0b112c',
  textMutedColor: '#475569',
  accentColor: '#1d4ed8',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

// ============================================================================
// ANIMATION HOOK
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
      damping: 22,
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

  return {
    opacity,
    transform: `translate3d(0, ${translateY}px, 0)`,
  };
};

// ============================================================================
// REUSABLE UI PRIMITIVES
// ============================================================================

const HeaderBadge: React.FC<{ text: string; inverted?: boolean; delay?: number }> = ({
  text,
  inverted = false,
  delay = 0,
}) => {
  const anim = useSpringEntrance(delay, 16);
  return (
    <div
      style={{
        ...anim,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        borderRadius: '999px',
        fontSize: '15px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        backgroundColor: inverted ? 'rgba(255, 255, 255, 0.12)' : 'rgba(2, 132, 199, 0.08)',
        color: inverted ? '#ffffff' : '#0284c7',
        border: inverted
          ? '1px solid rgba(255, 255, 255, 0.2)'
          : '1px solid rgba(2, 132, 199, 0.18)',
        width: 'fit-content',
      }}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: inverted ? '#38bdf8' : '#0284c7',
        }}
      />
      {text}
    </div>
  );
};

const NavigationFooter: React.FC<{ label?: string; delay?: number }> = ({
  label = 'Next Page',
  delay = 20,
}) => {
  const anim = useSpringEntrance(delay, 14);
  return (
    <div
      style={{
        ...anim,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '17px',
        fontWeight: 600,
        color: '#0284c7',
        cursor: 'default',
      }}
    >
      <span>{label}</span>
      <span style={{ fontSize: '20px', lineHeight: 1 }}>→</span>
    </div>
  );
};

// ============================================================================
// TEMPLATE 1: TITLE / COVER SLIDE (Dark Navy Brand Layout)
// ============================================================================

export const TitleSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
  theme,
}) => {
  const badgeAnim = useSpringEntrance(2);
  const titleAnim = useSpringEntrance(8, 36);
  const subAnim = useSpringEntrance(14, 24);
  const footAnim = useSpringEntrance(20, 20);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0c112a', // Authentic deep medical navy
        color: '#ffffff',
        fontFamily: theme.fontFamily,
        padding: '90px 120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Brand Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...badgeAnim,
        }}
      >
        <div>
          <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Borcelle Hospital[cite: 1]
          </div>
          <div style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>
            Care at Every Step[cite: 1]
          </div>
        </div>

        <HeaderBadge text={slide.visual.badge || 'Healthcare Presentation'} inverted />
      </div>

      {/* Main Title Centerpiece */}
      <div style={{ maxWidth: '1200px' }}>
        <h1
          style={{
            ...titleAnim,
            fontSize: '84px',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            margin: '0 0 24px 0',
            color: '#ffffff',
          }}
        >
          {slide.visual.title}
        </h1>
        {slide.visual.subtitle && (
          <p
            style={{
              ...subAnim,
              fontSize: '30px',
              fontWeight: 400,
              lineHeight: 1.45,
              color: '#94a3b8',
              margin: 0,
              maxWidth: '850px',
            }}
          >
            {slide.visual.subtitle}
          </p>
        )}
      </div>

      {/* Slide Footer */}
      <div
        style={{
          ...footAnim,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '32px',
          fontSize: '16px',
          color: '#64748b',
        }}
      >
        <span>Borcelle • 2025[cite: 1]</span>
        <span>{slide.visual.footerText || 'Compassionate Care at Every Step[cite: 1]'}</span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// TEMPLATE 2: TWO-COLUMN EDITORIAL (Narrative + Visual Showcase)
// ============================================================================

export const TwoColumnSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
  theme,
}) => {
  const badgeAnim = useSpringEntrance(2);
  const titleAnim = useSpringEntrance(7, 30);
  const textLeftAnim = useSpringEntrance(12, 24);
  const mediaAnim = useSpringEntrance(15, 30);

  // Splits narrative paragraphs if bullets are provided, or divides script
  const paragraphs = slide.visual.bullets || [
    slide.narration.script.slice(0, Math.floor(slide.narration.script.length / 2)),
    slide.narration.script.slice(Math.floor(slide.narration.script.length / 2)),
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        padding: '80px 100px',
        display: 'flex',
        flexDirection: 'row',
        gap: '70px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left Column: Narrative Content */}
      <div
        style={{
          flex: '1.15',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <HeaderBadge text={slide.visual.badge || 'Patient Experience'} />
          <h2
            style={{
              ...titleAnim,
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              color: theme.textColor,
              margin: '28px 0 36px 0',
            }}
          >
            {slide.visual.title}
          </h2>

          <div
            style={{
              ...textLeftAnim,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              color: theme.textMutedColor,
              fontSize: '20px',
              lineHeight: 1.65,
              maxWidth: '680px',
            }}
          >
            {paragraphs.map((p, idx) => (
              <p key={idx} style={{ margin: 0 }}>
                {p}
              </p>
            ))}
          </div>
        </div>

        <NavigationFooter label={slide.visual.footerText || 'Next Page'} delay={18} />
      </div>

      {/* Right Column: Tall Elegant Rounded Visual Container */}
      <div
        style={{
          ...mediaAnim,
          flex: '0.85',
          backgroundColor: theme.surfaceColor,
          borderRadius: '32px',
          border: '1px solid rgba(15, 23, 42, 0.08)',
          boxShadow: '0 20px 40px -12px rgba(15, 23, 42, 0.06)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '40px',
          position: 'relative',
        }}
      >
        {/* Subtle Decorative Clinical Tint Box */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(2, 132, 199, 0.04) 0%, rgba(2, 132, 199, 0.12) 100%)',
          }}
        />

        {slide.visual.highlightCard && (
          <div
            style={{
              position: 'relative',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(15, 23, 42, 0.06)',
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
            }}
          >
            {slide.visual.highlightCard.stat && (
              <div
                style={{
                  fontSize: '44px',
                  fontWeight: 800,
                  color: theme.primaryColor,
                  lineHeight: 1,
                  marginBottom: '10px',
                }}
              >
                {slide.visual.highlightCard.stat}
              </div>
            )}
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: theme.textColor,
                marginBottom: '8px',
              }}
            >
              {slide.visual.highlightCard.title}
            </div>
            <div style={{ fontSize: '15px', color: theme.textMutedColor, lineHeight: 1.5 }}>
              {slide.visual.highlightCard.text || slide.visual.highlightCard.subtitle}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// TEMPLATE 3: CARD GRID (3-Column Diagnostic / Feature Layout)
// ============================================================================

export const CardGridSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
  theme,
}) => {
  const titleAnim = useSpringEntrance(4, 28);
  const subtitleAnim = useSpringEntrance(8, 20);

  const cards = slide.visual.cards || [
    {
      title: 'Modern Equipment',
      description:
        'Advanced tools provide precise data that lead to more effective and personalized care plans.',
      tag: '01',
    },
    {
      title: 'Diagnostic Precision',
      description:
        'Modern equipment helps deliver quick diagnostic outcomes, reducing waiting time for treatment.',
      tag: '02',
    },
    {
      title: 'Early Intervention',
      description:
        'Timely identification of potential issues allows for earlier intervention and better health outcomes.',
      tag: '03',
    },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        padding: '80px 100px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header */}
      <div>
        <HeaderBadge text={slide.visual.badge || 'Clinical Excellence'} />
        <h2
          style={{
            ...titleAnim,
            fontSize: '54px',
            fontWeight: 800,
            color: theme.textColor,
            letterSpacing: '-0.025em',
            margin: '20px 0 12px 0',
          }}
        >
          {slide.visual.title}
        </h2>
        {slide.visual.subtitle && (
          <p
            style={{
              ...subtitleAnim,
              fontSize: '20px',
              color: theme.textMutedColor,
              margin: 0,
              maxWidth: '800px',
            }}
          >
            {slide.visual.subtitle}
          </p>
        )}
      </div>

      {/* 3 Modern Clean Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '32px',
          alignItems: 'stretch',
        }}
      >
        {cards.map((card, idx) => {
          const cardAnim = useSpringEntrance(12 + idx * 4, 30);
          return (
            <div
              key={idx}
              style={{
                ...cardAnim,
                backgroundColor: theme.surfaceColor,
                borderRadius: '26px',
                padding: '40px 36px',
                border: '1px solid rgba(15, 23, 42, 0.08)',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '360px',
              }}
            >
              {/* Card Header & Icon Mark */}
              <div>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(2, 132, 199, 0.08)',
                    color: theme.primaryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 800,
                    marginBottom: '28px',
                  }}
                >
                  {card.tag || `0${idx + 1}`}
                </div>

                <h3
                  style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: theme.textColor,
                    letterSpacing: '-0.015em',
                    lineHeight: 1.3,
                    margin: '0 0 16px 0',
                  }}
                >
                  {card.title}
                </h3>

                <p
                  style={{
                    fontSize: '17px',
                    color: theme.textMutedColor,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>

              {/* Card Footer Micro-detail */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: theme.primaryColor,
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(15, 23, 42, 0.05)',
                }}
              >
                <span>Read Overview</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Meta */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '15px',
          color: theme.textMutedColor,
        }}
      >
        <span>Borcelle Hospital Presentation</span>
        <span>{slide.visual.footerText || 'Advanced Medical Care'}</span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// TEMPLATE 4: STAT HIGHLIGHT (Massive Metrics + Editorial Columns)
// ============================================================================

export const StatHighlightSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
  theme,
}) => {
  const titleAnim = useSpringEntrance(4, 28);
  const contentAnim = useSpringEntrance(8, 24);
  const statBoxAnim = useSpringEntrance(14, 32);

  const mainMetric = slide.visual.metrics?.[0] || {
    value: '98%',
    label: 'Accuracy',
    subtext: 'Experience Meets Empathy',
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        padding: '80px 100px',
        display: 'flex',
        flexDirection: 'row',
        gap: '64px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left 60%: Narrative & Context */}
      <div
        style={{
          flex: '1.2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <HeaderBadge text={slide.visual.badge || 'Clinical Excellence'} />
          <h2
            style={{
              ...titleAnim,
              fontSize: '56px',
              fontWeight: 800,
              color: theme.textColor,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              margin: '24px 0 32px 0',
            }}
          >
            {slide.visual.title}
          </h2>

          <div
            style={{
              ...contentAnim,
              fontSize: '21px',
              lineHeight: 1.7,
              color: theme.textMutedColor,
              maxWidth: '720px',
            }}
          >
            <p style={{ margin: '0 0 24px 0' }}>
              {slide.visual.subtitle ||
                'Our team of healthcare experts brings a combination of experience, continuous learning, and genuine care. Through collaboration and up-to-date training, we provide accurate diagnoses and personalized treatment plans.'}
            </p>
            {slide.narration.script && (
              <p style={{ margin: 0, opacity: 0.9 }}>{slide.narration.script}</p>
            )}
          </div>
        </div>

        <NavigationFooter label="Learn More" delay={18} />
      </div>

      {/* Right 40%: Stat Highlight Block & Visual Accents */}
      <div
        style={{
          flex: '0.8',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          justifyContent: 'center',
        }}
      >
        {/* Main Metric Hero Card */}
        <div
          style={{
            ...statBoxAnim,
            backgroundColor: theme.surfaceColor,
            borderRadius: '30px',
            padding: '50px 44px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.04)',
          }}
        >
          {mainMetric.subtext && (
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: theme.primaryColor,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}
            >
              {mainMetric.subtext}
            </div>
          )}

          <div
            style={{
              fontSize: '96px',
              fontWeight: 800,
              color: theme.textColor,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              marginBottom: '12px',
            }}
          >
            {mainMetric.value}
          </div>

          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: theme.textMutedColor,
            }}
          >
            {mainMetric.label}
          </div>
        </div>

        {/* Secondary Supporting Stat/Feature Card */}
        {slide.visual.highlightCard && (
          <div
            style={{
              ...useSpringEntrance(18, 24),
              backgroundColor: 'rgba(2, 132, 199, 0.06)',
              borderRadius: '24px',
              padding: '30px 36px',
              border: '1px solid rgba(2, 132, 199, 0.16)',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: theme.textColor,
                marginBottom: '8px',
              }}
            >
              {slide.visual.highlightCard.title}
            </div>
            <div
              style={{
                fontSize: '16px',
                color: theme.textMutedColor,
                lineHeight: 1.5,
              }}
            >
              {slide.visual.highlightCard.text || slide.visual.highlightCard.subtitle}
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// TEMPLATE 5: BULLET LIST (Structured Clinical Points with Metric)
// ============================================================================

export const BulletListSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
  theme,
}) => {
  const titleAnim = useSpringEntrance(4, 28);
  const bullets = slide.visual.bullets || [
    'Comprehensive home recovery instructions and guidance.',
    'Dedicated 24/7 teleconsultation for post-treatment inquiries.',
    'Proactive follow-up scheduling to monitor sustained well-being.',
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
        padding: '80px 100px',
        display: 'flex',
        flexDirection: 'row',
        gap: '64px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flex: '1.2',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <HeaderBadge text={slide.visual.badge || 'Continued Support'} />
          <h2
            style={{
              ...titleAnim,
              fontSize: '56px',
              fontWeight: 800,
              color: theme.textColor,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              margin: '24px 0 40px 0',
            }}
          >
            {slide.visual.title}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {bullets.map((bullet, idx) => {
              const itemAnim = useSpringEntrance(10 + idx * 4, 20);
              return (
                <div
                  key={idx}
                  style={{
                    ...itemAnim,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '18px',
                    backgroundColor: theme.surfaceColor,
                    padding: '24px 28px',
                    borderRadius: '20px',
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(2, 132, 199, 0.12)',
                      color: theme.primaryColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    ✓
                  </div>
                  <span
                    style={{
                      fontSize: '19px',
                      color: theme.textColor,
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {bullet}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <NavigationFooter label="Care Protocol" delay={22} />
      </div>

      {/* Right Column Metric Box */}
      <div
        style={{
          flex: '0.8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            ...useSpringEntrance(14, 30),
            backgroundColor: theme.surfaceColor,
            borderRadius: '32px',
            padding: '50px 44px',
            border: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '0 16px 36px rgba(15, 23, 42, 0.04)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '100px',
              fontWeight: 800,
              color: theme.primaryColor,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              marginBottom: '14px',
            }}
          >
            {slide.visual.metrics?.[0]?.value || '89%'}
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: theme.textColor,
              marginBottom: '10px',
            }}
          >
            {slide.visual.metrics?.[0]?.label || 'Patient Satisfaction'}
          </div>
          <p
            style={{
              fontSize: '16px',
              color: theme.textMutedColor,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {slide.visual.metrics?.[0]?.subtext ||
              'Ensuring seamless continuity of care beyond hospital doors.'}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// TEMPLATE 6: CONCLUSION / THANK YOU SLIDE (Dark Navy Closing Layout)
// ============================================================================

export const ConclusionSlide: React.FC<{ slide: SlideData; theme: ThemeConfig }> = ({
  slide,
  theme,
}) => {
  const badgeAnim = useSpringEntrance(2);
  const titleAnim = useSpringEntrance(8, 36);
  const subAnim = useSpringEntrance(14, 24);
  const footAnim = useSpringEntrance(20, 20);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0c112a',
        color: '#ffffff',
        fontFamily: theme.fontFamily,
        padding: '90px 120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...badgeAnim,
        }}
      >
        <div>
          <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Borcelle Hospital[cite: 1]
          </div>
          <div style={{ fontSize: '15px', color: '#94a3b8', marginTop: '4px' }}>
            Care at Every Step[cite: 1]
          </div>
        </div>

        <HeaderBadge text="Healthcare Presentation" inverted />
      </div>

      <div style={{ maxWidth: '1000px' }}>
        <h1
          style={{
            ...titleAnim,
            fontSize: '96px',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            margin: '0 0 24px 0',
            color: '#ffffff',
          }}
        >
          {slide.visual.title || 'Thank You[cite: 1]'}
        </h1>
        <p
          style={{
            ...subAnim,
            fontSize: '28px',
            fontWeight: 400,
            lineHeight: 1.5,
            color: '#94a3b8',
            margin: 0,
            maxWidth: '800px',
          }}
        >
          {slide.visual.subtitle || 'Compassionate Care at Every Step[cite: 1]'}
        </p>
      </div>

      <div
        style={{
          ...footAnim,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          paddingTop: '32px',
          fontSize: '16px',
          color: '#64748b',
        }}
      >
        <span>Borcelle • 2025[cite: 1]</span>
        <span>borcellehospital.com</span>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// MAIN DISPATCHER COMPONENT
// ============================================================================

export const SlideRenderer: React.FC<{
  slide: SlideData;
  theme?: Partial<ThemeConfig>;
}> = ({ slide, theme: customTheme }) => {
  const theme: ThemeConfig = { ...DEFAULT_THEME, ...customTheme };

  const renderContent = () => {
    switch (slide.type) {
      case 'title':
        return <TitleSlide slide={slide} theme={theme} />;
      case 'two-column':
        return <TwoColumnSlide slide={slide} theme={theme} />;
      case 'card-grid':
        return <CardGridSlide slide={slide} theme={theme} />;
      case 'stat-highlight':
        return <StatHighlightSlide slide={slide} theme={theme} />;
      case 'bullet-list':
        return <BulletListSlide slide={slide} theme={theme} />;
      case 'conclusion':
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

      {/* Voiceover narration synchronization */}
      {slide.narration.audioPath && (
        <Audio src={slide.narration.audioPath} />
      )}
    </AbsoluteFill>
  );
};