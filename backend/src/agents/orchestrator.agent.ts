import { getLLMProvider, ILLMProvider } from '../providers/llm.provider.js';
import { PresentationManifest, PresentationManifestSchema } from '../types/presentation.js';

export interface OrchestratorOptions {
  templateId?: string;
  targetSlideCount?: number;
}

export class OrchestratorAgent {
  private llmProvider: ILLMProvider;

  constructor(llmProvider?: ILLMProvider) {
    this.llmProvider = llmProvider || getLLMProvider();
  }

  /**
   * Generates a fully validated presentation manifest from a user topic/prompt.
   */
  async generatePresentation(
    prompt: string,
    options?: OrchestratorOptions
  ): Promise<PresentationManifest> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    // Call LLM provider
    const rawManifest = await this.llmProvider.generatePresentationScript(prompt, {
      templateId: options?.templateId || 'tech-modern-dark',
      targetSlideCount: options?.targetSlideCount || 4,
    });

    // Validate structure against Zod schema
    const validatedManifest = PresentationManifestSchema.parse(rawManifest);

    return validatedManifest;
  }
}
