import { getLLMProvider, ILLMProvider } from '../providers/llm.provider';
import { PresentationManifest, PresentationManifestSchema } from '../types/presentation';

export interface OrchestratorOptions {
  templateId?: string;
  targetSlideCount?: number;
  pdfPath?: string;
}

export class OrchestratorAgent {
  private llmProvider: ILLMProvider;

  constructor(llmProvider?: ILLMProvider) {
    this.llmProvider = llmProvider || getLLMProvider();
  }

  /**
   * Generates a fully validated presentation manifest from a user topic/prompt or visual PDF.
   */
  async generatePresentation(
    prompt: string,
    options?: OrchestratorOptions
  ): Promise<PresentationManifest> {
    const rawManifest = await this.llmProvider.generatePresentationScript(prompt || '', {
      templateId: options?.templateId || 'tech-modern-dark',
      targetSlideCount: options?.targetSlideCount || 5,
      pdfPath: options?.pdfPath,
    });

    // Validate structure against Zod schema
    const validatedManifest = PresentationManifestSchema.parse(rawManifest);

    return validatedManifest;
  }
}
