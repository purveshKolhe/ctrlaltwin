import { z } from 'zod';

// Slide Types
export const SlideTypeEnum = z.enum([
  'title',
  'bullet-list',
  'stat-chart',
  'image-content',
  'quote',
]);
export type SlideType = z.infer<typeof SlideTypeEnum>;

// Chart Item Schema
export const ChartItemSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});
export type ChartItem = z.infer<typeof ChartItemSchema>;

// Metric Item Schema
export const MetricItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  subtext: z.string().optional(),
});
export type MetricItem = z.infer<typeof MetricItemSchema>;

// Visual Content Schema
export const VisualContentSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  metrics: z.array(MetricItemSchema).optional(),
  chartData: z.array(ChartItemSchema).optional(),
  chartType: z.enum(['bar', 'comparison']).optional(),
  imagePrompt: z.string().optional(),
  imageUrl: z.string().optional(),
  quote: z.string().optional(),
  author: z.string().optional(),
});
export type VisualContent = z.infer<typeof VisualContentSchema>;

// Narration & Audio Content Schema
export const NarrationContentSchema = z.object({
  // The spoken script (explicitly separated from visual copy to pronounce equations/symbols naturally)
  script: z.string(),
  // Generated audio metadata (populated after TTS processing)
  audioPath: z.string().optional(),
  durationSeconds: z.number().optional(),
  durationInFrames: z.number().optional(),
});
export type NarrationContent = z.infer<typeof NarrationContentSchema>;

// Individual Slide Schema
export const SlideDataSchema = z.object({
  id: z.string(),
  type: SlideTypeEnum,
  visual: VisualContentSchema,
  narration: NarrationContentSchema,
});
export type SlideData = z.infer<typeof SlideDataSchema>;

// Theme Schema
export const ThemeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundColor: z.string(),
  surfaceColor: z.string(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  textColor: z.string(),
  textMutedColor: z.string(),
  accentColor: z.string(),
  fontFamily: z.string().optional(),
});
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>;

// Master Presentation Manifest Schema
export const PresentationManifestSchema = z.object({
  id: z.string(),
  topic: z.string(),
  title: z.string(),
  templateId: z.string(),
  theme: ThemeConfigSchema.optional(),
  fps: z.number().default(30),
  width: z.number().default(1920),
  height: z.number().default(1080),
  totalDurationInFrames: z.number().default(0),
  slides: z.array(SlideDataSchema),
});
export type PresentationManifest = z.infer<typeof PresentationManifestSchema>;

// Remotion Root Props
export type RemotionPresentationProps = {
  manifest: PresentationManifest;
};
