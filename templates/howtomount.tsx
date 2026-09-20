import { Composition, Folder } from 'remotion';
import { SlideRenderer, SlideData } from './HealthcareSlideTemplates';

const sampleSlide: SlideData = {
  id: 'slide-01',
  type: 'stat-highlight',
  visual: {
    badge: 'Borcelle Hospital[cite: 1]',
    title: 'Skilled and Trusted Professionals[cite: 1]',
    subtitle:
      'Our team of healthcare experts brings a combination of experience, continuous learning, and genuine care.[cite: 1]',
    metrics: [
      {
        value: '98%',
        label: 'Diagnostic Accuracy[cite: 1]',
        subtext: 'Experience Meets Empathy[cite: 1]',
      },
    ],
    highlightCard: {
      title: 'Continuous Medical Training',
      text: 'Up-to-date protocol execution to guarantee modern patient safety.',
    },
    footerText: 'Borcelle Hospital Presentation[cite: 1]',
  },
  narration: {
    script:
      'Our team of healthcare experts brings years of clinical mastery and human empathy to every diagnosis.[cite: 1]',
    audioPath: 'https://your-storage-bucket.com/audio/slide-01.mp3',
  },
};

export const RemotionVideo = () => {
  return (
    <Folder name="HealthcareSlides">
      <Composition
        id="HealthcareSlide"
        component={SlideRenderer}
        durationInFrames={180} // 6 seconds @ 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          slide: sampleSlide,
        }}
      />
    </Folder>
  );
};