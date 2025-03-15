export interface MLPrediction {
  predictedScore: number;
  confidenceLevel: number;
  topRecommendations: string[];
  similarRepositories: string[];
  insightSummary: string;
}

export interface MLAnalysisLog {
  timestamp: number;
  repositoryId: string;
  analysisType: string;
  duration?: number;
  success?: boolean;
}

export interface SecurityConfig {
  disableNetworkFetch: boolean;
  isolateVisualizations: boolean;
  useSafeColorHandling: boolean;
}

// Add other interfaces from the MLAnalysisService 