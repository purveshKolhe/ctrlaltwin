import { getLLMProvider, ILLMProvider } from '../providers/llm.provider';
import { PresentationManifest, PresentationManifestSchema } from '../types/presentation';

export interface OrchestratorOptions {
  templateId?: string;
  targetSlideCount?: number;
  pdfPath?: string;
}

export class OrchestratorAgent {
  private customProvider?: ILLMProvider;

  constructor(llmProvider?: ILLMProvider) {
    this.customProvider = llmProvider;
  }

  /**
   * Generates a fully validated presentation manifest from a user topic/prompt or visual PDF.
   */
  async generatePresentation(
    prompt: string,
    options?: OrchestratorOptions
  ): Promise<PresentationManifest> {
    const provider = this.customProvider || getLLMProvider();
    const rawManifest = await provider.generatePresentationScript(prompt || '', {
      templateId: options?.templateId || 'healthcare-borcelle-new',
      targetSlideCount: options?.targetSlideCount || 5,
      pdfPath: options?.pdfPath,
    });

    // Validate structure against Zod schema
    const validatedManifest = PresentationManifestSchema.parse(rawManifest);

    return validatedManifest;
  }
}
