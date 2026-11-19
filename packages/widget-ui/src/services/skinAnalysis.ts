import type {
  AnalysisError,
  AnalysisErrorCode,
  AnalysisResult,
  Observation,
} from '../types/widget';

export interface MockScenarioData {
  name: string;
  summary: string;
  primaryFocus: string;
  observations: Observation[];
}

export const MOCK_SCENARIOS: Record<string, MockScenarioData> = {
  'balanced-glow': {
    name: 'Balanced Radiance',
    summary:
      'Optimal cellular turnover and healthy barrier resilience with balanced lipid distribution across facial zones.',
    primaryFocus: 'Antioxidant Protection & Daily Radiance Preservation',
    observations: [
      {
        label: 'Hydration',
        value: 'Optimal (82%)',
        note: 'Surface moisture levels are well-balanced with a resilient lipid barrier.',
        score: 82,
        level: 'optimal',
      },
      {
        label: 'Skin Texture',
        value: 'Smooth & Refined',
        note: 'Uniform cellular texture with minimal pore prominence.',
        score: 88,
        level: 'optimal',
      },
      {
        label: 'Sensitivity',
        value: 'Resilient',
        note: 'Calm complexion with healthy barrier tolerance and low reactivity.',
        score: 90,
        level: 'optimal',
      },
      {
        label: 'Oil Balance',
        value: 'Even Distribution',
        note: 'Balanced sebum production across both T-zone and cheek areas.',
        score: 85,
        level: 'optimal',
      },
    ],
  },
  'dry-hydration-needed': {
    name: 'Barrier Dehydration',
    summary:
      'Compromised stratum corneum hydration with heightened vulnerability to environmental moisture loss and flaking.',
    primaryFocus: 'Ceramide Replenishment & Intensive Moisture Sealing',
    observations: [
      {
        label: 'Hydration',
        value: 'Dehydrated (44%)',
        note: 'Decreased surface moisture with fine dehydration lines apparent.',
        score: 44,
        level: 'needs-attention',
      },
      {
        label: 'Skin Texture',
        value: 'Micro-Roughness',
        note: 'Localized tight sensation and mild flaking around cheek perimeters.',
        score: 60,
        level: 'moderate',
      },
      {
        label: 'Sensitivity',
        value: 'Mildly Reactive',
        note: 'Barrier is sensitized by low atmospheric humidity and seasonal dry air.',
        score: 64,
        level: 'moderate',
      },
      {
        label: 'Oil Balance',
        value: 'Low Sebum',
        note: 'Under-active lipid production seeking restorative emollient support.',
        score: 52,
        level: 'moderate',
      },
    ],
  },
  'oil-clarifying': {
    name: 'T-Zone Clarifying',
    summary:
      'Elevated follicular sebum output in central facial zones with high cellular tolerance for gentle clarifying botanicals.',
    primaryFocus: 'Pore Clarification & Lightweight Hydration Balancing',
    observations: [
      {
        label: 'Hydration',
        value: 'Moderate (68%)',
        note: 'Adequate hydration retained beneath active superficial lipid layers.',
        score: 68,
        level: 'good',
      },
      {
        label: 'Skin Texture',
        value: 'Enlarged Pores',
        note: 'Pronounced follicular visibility across nose and central forehead.',
        score: 58,
        level: 'moderate',
      },
      {
        label: 'Sensitivity',
        value: 'Resilient & Sturdy',
        note: 'Strong cellular resistance with high tolerance for gentle clarifying actives.',
        score: 86,
        level: 'optimal',
      },
      {
        label: 'Oil Balance',
        value: 'Elevated Sebum',
        note: 'Increased lipid output requiring lightweight balancing hydrators.',
        score: 48,
        level: 'needs-attention',
      },
    ],
  },
  'sensitive-soothing': {
    name: 'Sensitive & Delicate',
    summary:
      'Heightened epidermal reactivity and reactive micro-capillary flushing requiring restorative calming formulations.',
    primaryFocus: 'Anti-Redness Barrier Shield & Fragrance-Free Soothing',
    observations: [
      {
        label: 'Hydration',
        value: 'Delicate (56%)',
        note: 'Variable moisture retention requiring hypoallergenic barrier care.',
        score: 56,
        level: 'moderate',
      },
      {
        label: 'Skin Texture',
        value: 'Tender Surface',
        note: 'Soft surface texture with intermittent micro-vascular blushing.',
        score: 72,
        level: 'good',
      },
      {
        label: 'Sensitivity',
        value: 'Elevated Reactivity',
        note: 'Sensitive to temperature shifts, friction, and fragrance formulations.',
        score: 38,
        level: 'needs-attention',
      },
      {
        label: 'Oil Balance',
        value: 'Neutral',
        note: 'Normal sebum levels requiring non-comedogenic soothing hydration.',
        score: 76,
        level: 'good',
      },
    ],
  },
};

export const SCENARIO_KEYS = Object.keys(MOCK_SCENARIOS);

export const ANALYSIS_PROGRESS_PHASES = [
  'Calibrating lighting and facial landmarks...',
  'Analyzing surface hydration and moisture levels...',
  'Evaluating skin barrier and micro-texture...',
  'Synthesizing illustrative clinical observations...',
];

/**
 * Deterministically maps an input string (e.g. image object URL or session ID)
 * to one of the predefined mock scenarios.
 */
export function hashStringToScenario(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % SCENARIO_KEYS.length;
  return SCENARIO_KEYS[index] || 'balanced-glow';
}

export interface AnalyzeSkinOptions {
  imageUrl: string;
  scenarioOverride?: string;
  latencyMs?: number;
  timeoutMs?: number;
  simulateError?: AnalysisErrorCode;
  signal?: AbortSignal;
}

/**
 * Simulates skin analysis in browser memory.
 * Emits a deterministic AnalysisResult or rejects with an AnalysisError.
 */
export function analyzeSkin(options: AnalyzeSkinOptions): Promise<AnalysisResult> {
  const {
    imageUrl,
    scenarioOverride,
    latencyMs = 2000,
    timeoutMs = 8000,
    simulateError,
    signal,
  } = options;

  return new Promise<AnalysisResult>((resolve, reject) => {
    if (signal?.aborted) {
      const abortError: AnalysisError = {
        code: 'UNKNOWN',
        message: 'Analysis was cancelled.',
      };
      reject(abortError);
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let latencyId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (latencyId) clearTimeout(latencyId);
      if (signal) signal.removeEventListener('abort', handleAbort);
    };

    const handleAbort = () => {
      cleanup();
      const abortError: AnalysisError = {
        code: 'UNKNOWN',
        message: 'Analysis was cancelled.',
      };
      reject(abortError);
    };

    if (signal) {
      signal.addEventListener('abort', handleAbort);
    }

    // Set timeout safeguard
    timeoutId = setTimeout(() => {
      cleanup();
      const timeoutError: AnalysisError = {
        code: 'TIMEOUT',
        message: 'Skin analysis request timed out. Please try again.',
      };
      reject(timeoutError);
    }, timeoutMs);

    // Simulated latency before producing result
    latencyId = setTimeout(() => {
      cleanup();

      if (simulateError) {
        const errorMessages: Record<AnalysisErrorCode, string> = {
          TIMEOUT: 'Analysis timed out while processing image.',
          IMAGE_UNREADABLE: 'Photo quality was insufficient for skin assessment.',
          SERVICE_UNAVAILABLE: 'Analysis engine is temporarily unavailable.',
          UNKNOWN: 'An unexpected analysis error occurred.',
        };
        const simulatedErr: AnalysisError = {
          code: simulateError,
          message: errorMessages[simulateError] || 'Analysis failed.',
        };
        reject(simulatedErr);
        return;
      }

      const selectedScenarioKey =
        scenarioOverride && MOCK_SCENARIOS[scenarioOverride]
          ? scenarioOverride
          : hashStringToScenario(imageUrl);

      const scenario = MOCK_SCENARIOS[selectedScenarioKey] || MOCK_SCENARIOS['balanced-glow'];

      const result: AnalysisResult = {
        scenarioId: selectedScenarioKey,
        scenarioName: scenario.name,
        summary: scenario.summary,
        primaryFocus: scenario.primaryFocus,
        observations: scenario.observations,
        generatedAt: new Date().toISOString(),
      };

      resolve(result);
    }, latencyMs);
  });
}
