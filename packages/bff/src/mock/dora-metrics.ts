export interface DORAMetrics {
  deploymentFrequency: {
    value: number;
    unit: string;
    trend: number;
    rating: 'elite' | 'high' | 'medium' | 'low';
    history: { date: string; count: number }[];
  };
  leadTimeForChanges: {
    value: number;
    unit: string;
    trend: number;
    rating: 'elite' | 'high' | 'medium' | 'low';
    history: { date: string; hours: number }[];
  };
  changeFailureRate: {
    value: number;
    unit: string;
    trend: number;
    rating: 'elite' | 'high' | 'medium' | 'low';
    history: { date: string; rate: number }[];
  };
  meanTimeToRestore: {
    value: number;
    unit: string;
    trend: number;
    rating: 'elite' | 'high' | 'medium' | 'low';
    history: { date: string; hours: number }[];
  };
  overallRating: 'elite' | 'high' | 'medium' | 'low';
  teamComparison: {
    team: string;
    deployFreq: number;
    leadTime: number;
    cfr: number;
    mttr: number;
  }[];
}

function getRating(metric: string, value: number): 'elite' | 'high' | 'medium' | 'low' {
  switch (metric) {
    case 'deploymentFrequency':
      return value >= 7 ? 'elite' : value >= 3 ? 'high' : value >= 1 ? 'medium' : 'low';
    case 'leadTimeForChanges':
      return value <= 1 ? 'elite' : value <= 24 ? 'high' : value <= 168 ? 'medium' : 'low';
    case 'changeFailureRate':
      return value <= 5 ? 'elite' : value <= 10 ? 'high' : value <= 15 ? 'medium' : 'low';
    case 'meanTimeToRestore':
      return value <= 1 ? 'elite' : value <= 24 ? 'high' : value <= 168 ? 'medium' : 'low';
    default:
      return 'medium';
  }
}

export function generateDORAMetrics(): DORAMetrics {
  const deployFreqValue = Math.round((Math.random() * 10 + 2) * 10) / 10;
  const leadTimeValue = Math.round((Math.random() * 20 + 0.5) * 10) / 10;
  const cfrValue = Math.round((Math.random() * 12 + 1) * 10) / 10;
  const mttrValue = Math.round((Math.random() * 6 + 0.3) * 10) / 10;

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000);
    return date.toISOString().split('T')[0];
  });

  const deploymentFrequency = {
    value: deployFreqValue,
    unit: 'deploys/day',
    trend: Math.round((Math.random() * 30 - 10) * 10) / 10,
    rating: getRating('deploymentFrequency', deployFreqValue),
    history: last30Days.map((date) => ({
      date,
      count: Math.floor(Math.random() * 15) + 1,
    })),
  };

  const leadTimeForChanges = {
    value: leadTimeValue,
    unit: 'hours',
    trend: Math.round((Math.random() * -20 + 5) * 10) / 10,
    rating: getRating('leadTimeForChanges', leadTimeValue),
    history: last30Days.map((date) => ({
      date,
      hours: Math.round((Math.random() * 30 + 0.5) * 10) / 10,
    })),
  };

  const changeFailureRate = {
    value: cfrValue,
    unit: '%',
    trend: Math.round((Math.random() * -5 + 2) * 10) / 10,
    rating: getRating('changeFailureRate', cfrValue),
    history: last30Days.map((date) => ({
      date,
      rate: Math.round(Math.random() * 15 * 10) / 10,
    })),
  };

  const meanTimeToRestore = {
    value: mttrValue,
    unit: 'hours',
    trend: Math.round((Math.random() * -3 + 1) * 10) / 10,
    rating: getRating('meanTimeToRestore', mttrValue),
    history: last30Days.map((date) => ({
      date,
      hours: Math.round((Math.random() * 8 + 0.2) * 10) / 10,
    })),
  };

  const ratings = [deploymentFrequency.rating, leadTimeForChanges.rating, changeFailureRate.rating, meanTimeToRestore.rating];
  const ratingScores = { elite: 4, high: 3, medium: 2, low: 1 };
  const avgScore = ratings.reduce((sum, r) => sum + ratingScores[r], 0) / ratings.length;
  const overallRating: 'elite' | 'high' | 'medium' | 'low' =
    avgScore >= 3.5 ? 'elite' : avgScore >= 2.5 ? 'high' : avgScore >= 1.5 ? 'medium' : 'low';

  const teams = ['Platform', 'Payments', 'Auth', 'Frontend', 'Data'];
  const teamComparison = teams.map((team) => ({
    team,
    deployFreq: Math.round((Math.random() * 10 + 1) * 10) / 10,
    leadTime: Math.round((Math.random() * 30 + 1) * 10) / 10,
    cfr: Math.round(Math.random() * 15 * 10) / 10,
    mttr: Math.round((Math.random() * 8 + 0.5) * 10) / 10,
  }));

  return {
    deploymentFrequency,
    leadTimeForChanges,
    changeFailureRate,
    meanTimeToRestore,
    overallRating,
    teamComparison,
  };
}
