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

// Resilient Visual Content Schema
export const VisualContentSchema = z.object({
  title: z
    .preprocess((val) => (typeof val === 'string' && val.trim() ? val : 'Summary'), z.string())
    .default('Summary'),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  metrics: z
    .preprocess((val) => {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return Object.entries(val).map(([label, value]) => ({
          label,
          value: String(value),
        }));
      }
      return val;
    }, z.array(MetricItemSchema).optional())
    .optional(),
  chartData: z
    .preprocess((val) => {
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return Object.entries(val).map(([label, value]) => ({
          label,
          value: typeof value === 'number' ? value : Number(value) || 0,
        }));
      }
      return val;
    }, z.array(ChartItemSchema).optional())
    .optional(),
  chartType: z.enum(['bar', 'comparison']).optional(),
  imagePrompt: z.string().optional(),
  imageUrl: z.string().optional(),
  quote: z.string().optional(),
  author: z.string().optional(),
});
export type VisualContent = z.infer<typeof VisualContentSchema>;

// Narration & Audio Content Schema
export const NarrationContentSchema = z.object({
  script: z
    .preprocess((val) => (typeof val === 'string' ? val : ''), z.string())
    .default(''),
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
