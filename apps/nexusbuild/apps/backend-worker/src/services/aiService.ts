import { PartSpec } from "../data/parts";
// @ts-ignore
import { ROAST_LOGIC } from "./knowledge/roastMyBuild";
// @ts-ignore
import { getFPS } from "./knowledge/benchmarks";

export interface BuildReview {
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  bottlenecks: string[];
  fpsEstimates: Record<string, number>;
}

export interface AIServiceConfig {
  openRouterApiKey?: string | null;
  openRouterModel?: string | null;
  appName?: string;
  appUrl?: string;
}

type BuildPartSummary = {
  category: string;
  name: string;
  brand: string;
  price: number;
  releaseYear: number;
  rating?: number;
  popularity?: number;
  specs: Record<string, string | number | boolean>;
};

interface OpenRouterChoice {
  message: {
    content: string | null;
  };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemma-2-9b-it:free";
const DEFAULT_MAX_TOKENS = 900;
const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_APP_NAME = "NexusBuild";
const DEFAULT_APP_URL = "https://northernstepstudio.com";

export class AIService {
  async analyzeBuild(
    parts: Record<string, PartSpec>,
    budget?: number,
    config: AIServiceConfig = {},
  ): Promise<BuildReview> {
    const fallback = this.ruleBasedAnalysis(parts, budget);
    const apiKey = config.openRouterApiKey?.trim();

    if (!apiKey) {
      return fallback;
    }

    try {
      const modelReview = await this.requestOpenRouterReview(
        parts,
        budget,
        fallback,
        {
          apiKey,
          model: config.openRouterModel?.trim() || DEFAULT_MODEL,
          appName: config.appName?.trim() || DEFAULT_APP_NAME,
          appUrl: config.appUrl?.trim() || DEFAULT_APP_URL,
        },
      );

      return this.mergeReviews(fallback, modelReview);
    } catch (error) {
      console.warn(
        "[AIService] OpenRouter review failed, using rule-based fallback:",
        error instanceof Error ? error.message : String(error),
      );
      return fallback;
    }
  }

  private async requestOpenRouterReview(
    parts: Record<string, PartSpec>,
    budget: number | undefined,
    fallback: BuildReview,
    config: Required<Pick<AIServiceConfig, "appName" | "appUrl">> & {
      apiKey: string;
      model: string;
    },
  ): Promise<Partial<BuildReview>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": config.appUrl,
          "X-OpenRouter-Title": config.appName,
        },
        body: JSON.stringify({
          model: config.model,
          temperature: 0.2,
          max_tokens: DEFAULT_MAX_TOKENS,
          messages: [
            {
              role: "system",
              content: this.buildReviewSystemPrompt(),
            },
            {
              role: "user",
              content: this.buildReviewUserPrompt(parts, budget, fallback),
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices?.[0]?.message?.content;

      if (!content || !content.trim()) {
        throw new Error("OpenRouter returned an empty assistant response");
      }

      const parsed = this.parseModelReview(content);
      return this.normalizeModelReview(parsed, fallback);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildReviewSystemPrompt(): string {
    return [
      "You are NexusBuild, a practical PC build reviewer.",
      "Return only valid JSON. Do not use markdown or code fences.",
      'Schema: {"score":number,"summary":string,"pros":string[],"cons":string[],"bottlenecks":string[]}',
      "Rules:",
      "- Score must be an integer from 0 to 100.",
      "- summary must be a single concise sentence.",
      "- pros, cons, and bottlenecks should each be short bullet-style strings.",
      "- Keep each list to at most 4 items.",
      "- Use only the provided build data and baseline signals.",
      "- Do not invent parts, prices, compatibility issues, or performance numbers.",
      "- Keep the tone direct and product-like.",
    ].join("\n");
  }

  private buildReviewUserPrompt(
    parts: Record<string, PartSpec>,
    budget: number | undefined,
    fallback: BuildReview,
  ): string {
    return JSON.stringify(
      {
        budget: budget ?? null,
        build: this.serializeParts(parts),
        baseline: {
          score: fallback.score,
          summary: fallback.summary,
          pros: fallback.pros,
          cons: fallback.cons,
          bottlenecks: fallback.bottlenecks,
        },
      },
      null,
      2,
    );
  }

  private serializeParts(parts: Record<string, PartSpec>): BuildPartSummary[] {
    return Object.entries(parts)
      .filter(([, part]) => Boolean(part))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, part]) => ({
        category,
        name: part.name,
        brand: part.brand,
        price: part.price,
        releaseYear: part.releaseYear,
        rating: part.rating,
        popularity: part.popularity,
        specs: { ...(part.specs || {}) },
      }));
  }

  private parseModelReview(content: string): unknown {
    const trimmed = content.trim();
    const withoutFence = trimmed
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");
    const firstBrace = withoutFence.indexOf("{");
    const lastBrace = withoutFence.lastIndexOf("}");
    const candidate =
      firstBrace >= 0 && lastBrace > firstBrace
        ? withoutFence.slice(firstBrace, lastBrace + 1)
        : withoutFence;

    return JSON.parse(candidate);
  }

  private normalizeModelReview(
    value: unknown,
    fallback: BuildReview,
  ): Partial<BuildReview> {
    if (!value || typeof value !== "object") {
      throw new Error("OpenRouter review payload was not an object");
    }

    const review = value as Record<string, unknown>;

    return {
      score: this.clampScore(review.score, fallback.score),
      summary: this.normalizeText(review.summary, fallback.summary),
      pros: this.normalizeTextArray(review.pros, fallback.pros),
      cons: this.normalizeTextArray(review.cons, fallback.cons),
      bottlenecks: this.normalizeTextArray(
        review.bottlenecks,
        fallback.bottlenecks,
      ),
    };
  }

  private mergeReviews(
    fallback: BuildReview,
    modelReview: Partial<BuildReview>,
  ): BuildReview {
    return {
      score: modelReview.score ?? fallback.score,
      summary: modelReview.summary?.trim() || fallback.summary,
      pros: modelReview.pros?.length ? modelReview.pros : fallback.pros,
      cons: modelReview.cons?.length ? modelReview.cons : fallback.cons,
      bottlenecks: modelReview.bottlenecks?.length
        ? modelReview.bottlenecks
        : fallback.bottlenecks,
      fpsEstimates: fallback.fpsEstimates,
    };
  }

  private clampScore(value: unknown, fallbackScore: number): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return fallbackScore;
    }
    return Math.min(100, Math.max(0, Math.round(parsed)));
  }

  private normalizeText(value: unknown, fallback: string): string {
    if (typeof value !== "string") {
      return fallback;
    }

    const cleaned = value.trim().replace(/\s+/g, " ");
    return cleaned.length > 0 ? cleaned : fallback;
  }

  private normalizeTextArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) {
      return fallback;
    }

    const cleaned = value
      .map((entry) => this.normalizeBullet(String(entry ?? "")))
      .filter((entry) => entry.length > 0)
      .slice(0, 4);

    return cleaned.length > 0 ? cleaned : fallback;
  }

  private normalizeBullet(value: string): string {
    return value
      .trim()
      .replace(/^[-*•\u2022]+\s*/, "")
      .replace(/\s+/g, " ");
  }

  /**
   * Rule-based analysis for quick feedback / fallback.
   */
  private ruleBasedAnalysis(
    parts: Record<string, PartSpec>,
    budget?: number,
  ): BuildReview {
    const cpu = parts.cpu;
    const gpu = parts.gpu;
    const ram = parts.ram;
    const psu = parts.psu;
    const storage = parts.storage;

    const pros: string[] = [];
    const cons: string[] = [];
    const bottlenecks: string[] = [];
    const fps: Record<string, number> = {};

    let score = 75;

    // 1. ROAST / BOTTLENECK CHECKS (Using ROAST_LOGIC)
    if (cpu && gpu) {
      const cpuPrice = cpu.price || 0;
      const gpuPrice = gpu.price || 0;

      // Check for CPU Bottleneck
      if (
        ROAST_LOGIC.bottlenecks.cpu_bottleneck.check(
          { price: cpuPrice },
          { price: gpuPrice },
        )
      ) {
        bottlenecks.push(
          ROAST_LOGIC.bottlenecks.cpu_bottleneck.roast
            .replace("${gpu}", gpu.name)
            .replace("${cpu}", cpu.name),
        );
        score -= 20;
      }
      // Check for GPU Bottleneck
      else if (
        ROAST_LOGIC.bottlenecks.gpu_bottleneck.check(
          { price: cpuPrice },
          { price: gpuPrice },
        )
      ) {
        bottlenecks.push(
          ROAST_LOGIC.bottlenecks.gpu_bottleneck.roast
            .replace("${gpu}", gpu.name)
            .replace("${cpu}", cpu.name),
        );
        score -= 15;
      } else {
        pros.push(
          `Excellent balance between your ${cpu.name} and ${gpu.name}.`,
        );
        score += 10;
      }

      // Get Expert FPS Estimates (1080p Ultra)
      const games = [
        "Cyberpunk 2077",
        "Valorant",
        "Fortnite",
        "Modern Warfare III",
      ];
      games.forEach((game) => {
        const est = getFPS(gpu.name, game, "1080p");
        if (est) fps[game] = est;
      });
    }

    // 2. RAM & VALUE CHECKS
    if (ram) {
      const ramSize = parseInt(
        String(ram.specs?.capacity || "16").replace("GB", ""),
      );
      if (ramSize < 16) {
        cons.push(
          "8GB of RAM is tight for 2024. 16GB is the minimum for gaming.",
        );
        score -= 10;
      } else if (ramSize >= 32) {
        pros.push("32GB+ of RAM provides massive headroom for multitasking.");
        score += 5;
      }
    }

    // 3. STORAGE CHECKS
    if (storage) {
      if (
        ROAST_LOGIC.badValue.hdd_boot.check({
          type: storage.specs?.type,
          isBoot: true,
        })
      ) {
        cons.push(ROAST_LOGIC.badValue.hdd_boot.roast);
        score -= 25;
      }
    }

    // 4. PSU SAFETY
    if (psu) {
      const totalCost = Object.values(parts).reduce(
        (sum, p) => sum + (p.price || 0),
        0,
      );
      if (
        ROAST_LOGIC.badValue.cheap_psu.check({ price: psu.price }, totalCost)
      ) {
        cons.push(ROAST_LOGIC.badValue.cheap_psu.roast);
        score -= 15;
      }
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      summary:
        score >= 85
          ? "Stunning build! You've picked premium, balanced components."
          : score >= 70
            ? "Solid mid-range build with good foundations."
            : "This build needs optimization. Check the bottlenecks and warnings below.",
      pros: pros.length ? pros : ["Functional components selected."],
      cons,
      bottlenecks,
      fpsEstimates: fps,
    };
  }
}
