import axios from 'axios';

const API_BASE = '/api';

export interface PresentationSlide {
  index: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  narration?: string;
  image?: string | null;
}

export interface PresentationItem {
  id: string;
  title: string;
  subtitle?: string;
  prompt: string;
  thumbnail?: string | null;
  slide_count: number;
  created_at: string;
  status: string;
  hasVideo?: boolean;
  progress?: number;
}

export interface PresentationDetail {
  id: string;
  title: string;
  status: 'pending' | 'orchestrating' | 'generating_assets' | 'syncing' | 'rendering' | 'completed' | 'failed';
  progress: number;
  prompt: string;
  templateId?: string;
  manifest?: any;
  slides: PresentationSlide[];
  videoUrl?: string;
  hasVideo?: boolean;
  error?: string;
  logs?: string[];
  metrics?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export interface GeneratePayload {
  prompt?: string;
  templateId?: string;
  slide_count?: number;
  tone?: string;
  with_images?: boolean;
  pdfFile?: File | null;
}

export async function listPresentations(): Promise<PresentationItem[]> {
  const res = await axios.get<PresentationItem[]>(`${API_BASE}/presentations`);
  return res.data;
}

export async function getPresentation(id: string): Promise<PresentationDetail> {
  const res = await axios.get<PresentationDetail>(`${API_BASE}/presentations/${id}`);
  return res.data;
}

export async function deletePresentation(id: string): Promise<{ ok: boolean }> {
  const res = await axios.delete<{ ok: boolean }>(`${API_BASE}/presentations/${id}`);
  return res.data;
}

export async function listTemplates(): Promise<TemplateItem[]> {
  try {
    const res = await axios.get<{ templates: TemplateItem[] }>(`${API_BASE}/templates`);
    return res.data.templates || [];
  } catch {
    return [];
  }
}

export async function generatePresentation(
  payload: GeneratePayload,
  onProgress?: (job: PresentationDetail) => void
): Promise<PresentationDetail> {
  let jobId: string;

  if (payload.pdfFile) {
    const formData = new FormData();
    formData.append('pdf', payload.pdfFile);
    if (payload.prompt) formData.append('prompt', payload.prompt);
    if (payload.templateId) formData.append('templateId', payload.templateId);

    const postRes = await axios.post<{ jobId: string; status: string }>(
      `${API_BASE}/presentations`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    jobId = postRes.data.jobId;
  } else {
    const postRes = await axios.post<{ jobId: string; status: string }>(
      `${API_BASE}/presentations`,
      {
        prompt: payload.prompt,
        templateId: payload.templateId || 'healthcare-borcelle-new',
      }
    );
    jobId = postRes.data.jobId;
  }

  // Poll for completion
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const detail = await getPresentation(jobId);
        if (onProgress) {
          onProgress(detail);
        }

        if (detail.status === 'completed') {
          clearInterval(interval);
          resolve(detail);
        } else if (detail.status === 'failed') {
          clearInterval(interval);
          reject(new Error(detail.error || 'Presentation generation failed'));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, 1500);
  });
}
