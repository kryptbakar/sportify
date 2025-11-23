// ELO Rating utilities
export function getTierFromElo(elo: number): string {
  if (elo >= 1600) return 'Platinum';
  if (elo >= 1400) return 'Gold';
  if (elo >= 1200) return 'Silver';
  return 'Bronze';
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'Platinum':
      return 'from-slate-300 to-slate-500';
    case 'Gold':
      return 'from-yellow-300 to-yellow-600';
    case 'Silver':
      return 'from-gray-300 to-gray-500';
    case 'Bronze':
      return 'from-amber-600 to-amber-800';
    default:
      return 'from-gray-400 to-gray-600';
  }
}

export function getTierTextColor(tier: string): string {
  switch (tier) {
    case 'Platinum':
      return 'text-slate-700';
    case 'Gold':
      return 'text-yellow-800';
    case 'Silver':
      return 'text-gray-700';
    case 'Bronze':
      return 'text-amber-900';
    default:
      return 'text-gray-700';
  }
}

// Calculate expected ELO outcome
export function getExpectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Calculate new ELO rating
export function calculateNewElo(
  currentRating: number,
  opponentRating: number,
  actualScore: number, // 1 for win, 0.5 for draw, 0 for loss
  kFactor: number = 32
): number {
  const expected = getExpectedScore(currentRating, opponentRating);
  return Math.round(currentRating + kFactor * (actualScore - expected));
}
