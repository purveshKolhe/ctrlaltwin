import path from 'path';
import { fileURLToPath } from 'url';
import { GenerationJob, PresentationPipeline } from './pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTest() {
  console.log('🚀 Starting end-to-end presentation pipeline test...');

  const pipeline = new PresentationPipeline();
  const workDir = path.resolve(__dirname, '../out/test-run');

  const job: GenerationJob = {
    id: `test-${Date.now()}`,
    prompt: 'Minimally Invasive Robotic Surgery and Precision Medicine',
    templateId: 'healthcare-borcelle-new',
    status: 'pending',
    progress: 0,
    logs: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const result = await pipeline.execute(job, workDir, (updated) => {
      console.log(`[Job Progress] Stage: ${updated.status} | Progress: ${updated.progress}%`);
    });

    console.log('✅ Pipeline execution finished successfully!');
    console.log(`📁 Video output path: ${result.videoPath}`);
    console.log(`⏱️ Total frames: ${result.manifest?.totalDurationInFrames}`);
    console.log(`📊 Number of slides generated: ${result.manifest?.slides.length}`);
    
    if (result.manifest?.slides) {
      result.manifest.slides.forEach((slide, idx) => {
        console.log(`  Slide ${idx + 1} (${slide.type}): "${slide.visual.title}" | Duration: ${slide.narration.durationInFrames} frames (~${slide.narration.durationSeconds}s)`);
      });
    }
  } catch (err) {
    console.error('❌ Pipeline failed with error:', err);
    process.exit(1);
  }
}

runTest();
