export interface IncidentPrediction {
  deploymentId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
  similarIncidents: SimilarIncident[];
}

export interface SimilarIncident {
  id: string;
  title: string;
  severity: string;
  date: string;
  resolution: string;
  similarity: number;
}

export interface AnomalyDetection {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  source: string;
}

export interface AlertCluster {
  clusterId: string;
  rootCause: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertCount: number;
  alerts: DedupedAlert[];
  suggestedAction: string;
  affectedServices: string[];
  firstSeen: string;
  lastSeen: string;
}

export interface DedupedAlert {
  id: string;
  source: string;
  message: string;
  timestamp: string;
  severity: string;
}

export interface LogPattern {
  pattern: string;
  count: number;
  severity: string;
  firstSeen: string;
  lastSeen: string;
  sampleMessages: string[];
}
