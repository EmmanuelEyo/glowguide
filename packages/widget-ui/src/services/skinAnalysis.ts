import type {
  AnalysisError,
  AnalysisErrorCode,
  AnalysisResult,
  Observation,
} from '../types/widget';

export const MOCK_SCENARIOS: Record<string, { name: string; observations: Observation[] }> = {
  'balanced-glow': {
    name: 'Balanced Radiance',
    observations: [
      {
        label: 'Hydration',
        value: 'Optimal (82%)',
        note: 'Surface moisture levels are well-balanced with a resilient lipid barrier.',
      },
      {
        label: 'Skin Texture',
        value: 'Smooth & Refined',
        note: 'Uniform cellular texture with minimal pore prominence.',
      },
      {
        label: 'Sensitivity',
        value: 'Resilient',
        note: 'Calm complexion with healthy barrier tolerance and low reactivity.',
      },
      {
        label: 'Oil Balance',
        value: 'Even Distribution',
        note: 'Balanced sebum production across both T-zone and cheek areas.',
      },
    ],
  },
  'dry-hydration-needed': {
    name: 'Barrier Dehydration',
    observations: [
      {
        label: 'Hydration',
        value: 'Dehydrated (44%)',
        note: 'Decreased surface moisture with fine dehydration lines apparent.',
      },
      {
        label: 'Skin Texture',
        value: 'Micro-Roughness',
        note: 'Localized tight sensation and mild flaking around cheek perimeters.',
      },
      {
        label: 'Sensitivity',
        value: 'Mildly Reactive',
        note: 'Barrier is sensitized by low atmospheric humidity and seasonal dry air.',
      },
      {
        label: 'Oil Balance',
        value: 'Low Sebum',
        note: 'Under-active lipid production seeking restorative emollient support.',
      },
    ],
  },
  'oil-clarifying': {
    name: 'T-Zone Clarifying',
    observations: [
      {
        label: 'Hydration',
        value: 'Moderate (68%)',
        note: 'Adequate hydration retained beneath active superficial lipid layers.',
      },
      {
        label: 'Skin Texture',
        value: 'Enlarged Pores',
        note: 'Pronounced follicular visibility across nose and central forehead.',
      },
      {
        label: 'Sensitivity',
        value: 'Resilient & Sturdy',
        note: 'Strong cellular resistance with high tolerance for gentle clarifying actives.',
      },
      {
        label: 'Oil Balance',
        value: 'Elevated Sebum',
        note: 'Increased lipid output requiring lightweight balancing hydrators.',
      },
    ],
  },
  'sensitive-soothing': {
    name: 'Sensitive & Delicate',
    observations: [
      {
        label: 'Hydration',
        value: 'Delicate (56%)',
        note: 'Variable moisture retention requiring hypoallergenic barrier care.',
      },
      {
        label: 'Skin Texture',
        value: 'Tender Surface',
        note: 'Soft surface texture with intermittent micro-vascular blushing.',
      },
      {
        label: 'Sensitivity',
        value: 'Elevated Reactivity',
        note: 'Sensitive to temperature shifts, friction, and fragrance formulations.',
      },
      {
        label: 'Oil Balance',
        value: 'Neutral',
        note: 'Normal sebum levels requiring non-comedogenic soothing hydration.',
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
        observations: scenario.observations,
        generatedAt: new Date().toISOString(),
      };

      resolve(result);
    }, latencyMs);
  });
}
