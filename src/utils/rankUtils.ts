export type RankTier =
  | 'Beginner'
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Master'
  | 'GrandMaster'
  | 'God';

export interface RankInfo {
  tier: RankTier;
  labelJa: string;
  minPoints: number;
  maxPoints: number;
  badgeEmoji: string;
  primaryColor: string;
  accentColor: string;
  borderColor: string;
  auraGlow: string;
  auraIntensity: 'subtle' | 'medium' | 'high' | 'ultra' | 'celestial';
  title: string;
  entryFee: number; // Stricter entry fee for higher ranks
}

export const RANK_CONFIGS: Record<RankTier, RankInfo> = {
  Beginner: {
    tier: 'Beginner',
    labelJa: 'ビギナー',
    minPoints: 0,
    maxPoints: 199,
    badgeEmoji: '🛡️',
    primaryColor: '#94a3b8', // slate-400
    accentColor: '#64748b', // slate-500
    borderColor: 'border-slate-600/60',
    auraGlow: 'shadow-[0_0_20px_rgba(148,163,184,0.15)]',
    auraIntensity: 'subtle',
    title: '駆け出しの戦士',
    entryFee: 0,
  },
  Bronze: {
    tier: 'Bronze',
    labelJa: 'ブロンズ',
    minPoints: 200,
    maxPoints: 449,
    badgeEmoji: '🥉',
    primaryColor: '#d97706', // amber-600
    accentColor: '#b45309', // amber-700
    borderColor: 'border-amber-700/60',
    auraGlow: 'shadow-[0_0_25px_rgba(217,119,6,0.3)]',
    auraIntensity: 'subtle',
    title: '歴戦のブロンズ',
    entryFee: 3,
  },
  Silver: {
    tier: 'Silver',
    labelJa: 'シルバー',
    minPoints: 450,
    maxPoints: 799,
    badgeEmoji: '🥈',
    primaryColor: '#e2e8f0', // slate-200
    accentColor: '#cbd5e1', // slate-300
    borderColor: 'border-slate-400/80',
    auraGlow: 'shadow-[0_0_30px_rgba(226,232,240,0.35)]',
    auraIntensity: 'medium',
    title: '白銀の精鋭',
    entryFee: 6,
  },
  Gold: {
    tier: 'Gold',
    labelJa: 'ゴールド',
    minPoints: 800,
    maxPoints: 1249,
    badgeEmoji: '🏆',
    primaryColor: '#facc15', // yellow-400
    accentColor: '#eab308', // yellow-500
    borderColor: 'border-yellow-400/90',
    auraGlow: 'shadow-[0_0_40px_rgba(250,204,21,0.45)]',
    auraIntensity: 'medium',
    title: '黄金の英雄',
    entryFee: 10,
  },
  Platinum: {
    tier: 'Platinum',
    labelJa: 'プラチナ',
    minPoints: 1250,
    maxPoints: 1799,
    badgeEmoji: '💠',
    primaryColor: '#22d3ee', // cyan-400
    accentColor: '#06b6d4', // cyan-500
    borderColor: 'border-cyan-400/90',
    auraGlow: 'shadow-[0_0_45px_rgba(34,211,238,0.55)]',
    auraIntensity: 'high',
    title: '蒼穹の守護者',
    entryFee: 15,
  },
  Diamond: {
    tier: 'Diamond',
    labelJa: 'ダイヤモンド',
    minPoints: 1800,
    maxPoints: 2499,
    badgeEmoji: '💎',
    primaryColor: '#38bdf8', // sky-400
    accentColor: '#60a5fa', // blue-400
    borderColor: 'border-sky-300',
    auraGlow: 'shadow-[0_0_50px_rgba(56,189,248,0.65)]',
    auraIntensity: 'high',
    title: '金剛石の覇者',
    entryFee: 20,
  },
  Master: {
    tier: 'Master',
    labelJa: 'マスター',
    minPoints: 2500,
    maxPoints: 3299,
    badgeEmoji: '🔮',
    primaryColor: '#c084fc', // purple-400
    accentColor: '#a855f7', // purple-500
    borderColor: 'border-purple-400',
    auraGlow: 'shadow-[0_0_55px_rgba(192,132,252,0.7)]',
    auraIntensity: 'ultra',
    title: '紫電の導師',
    entryFee: 26,
  },
  GrandMaster: {
    tier: 'GrandMaster',
    labelJa: 'グランドマスター',
    minPoints: 3300,
    maxPoints: 4199,
    badgeEmoji: '🔥',
    primaryColor: '#f87171', // red-400
    accentColor: '#ef4444', // red-500
    borderColor: 'border-red-400',
    auraGlow: 'shadow-[0_0_60px_rgba(239,68,68,0.8)]',
    auraIntensity: 'ultra',
    title: '業火の闘神',
    entryFee: 32,
  },
  God: {
    tier: 'God',
    labelJa: 'ゴッド (God)',
    minPoints: 4200,
    maxPoints: 999999,
    badgeEmoji: '👑',
    primaryColor: '#f59e0b', // amber-500 & rainbow
    accentColor: '#ec4899', // pink-500
    borderColor: 'border-amber-300',
    auraGlow: 'shadow-[0_0_75px_rgba(245,158,11,0.85),0_0_120px_rgba(168,85,247,0.5)]',
    auraIntensity: 'celestial',
    title: '超越の神格',
    entryFee: 38,
  },
};

export const ALL_RANKS: RankTier[] = [
  'Beginner',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Master',
  'GrandMaster',
  'God',
];

export function getRankTier(points: number = 0, rating: number | null = null): RankTier {
  const effPoints = (rating !== null && rating >= 4200) ? rating : points;
  for (let i = ALL_RANKS.length - 1; i >= 0; i--) {
    const tier = ALL_RANKS[i];
    if (effPoints >= RANK_CONFIGS[tier].minPoints) {
      return tier;
    }
  }
  return 'Beginner';
}

export function getRankInfo(points: number = 0, rating: number | null = null): RankInfo {
  const tier = getRankTier(points, rating);
  return RANK_CONFIGS[tier];
}

/**
 * Strict Competitive Rating Calculator across Solo, Duo, and Trio modes.
 * Enforces slower progression, entry fees based on tier, strict placement points,
 * and high penalty for early eliminations.
 */
export interface RatingCalculationResult {
  ratingChange: number;
  placementPoints: number;
  killBonus: number;
  entryFee: number;
  isWin: boolean;
  finalPlacement: number;
}

export function calculateStrictRatingChange(
  mode: 'ranked' | 'ranked_duo' | 'ranked_trio' | string,
  currentPoints: number,
  placement: number,
  kills: number,
  totalPlayersInMatch: number = 20
): RatingCalculationResult {
  const tier = getRankTier(currentPoints);
  const info = RANK_CONFIGS[tier];
  const entryFee = info.entryFee;
  const isWin = placement === 1;

  let placementPoints = 0;
  if (isWin) {
    placementPoints = mode === 'ranked' ? 14 : mode === 'ranked_duo' ? 12 : 10;
  } else if (placement === 2) {
    placementPoints = mode === 'ranked' ? 6 : mode === 'ranked_duo' ? 5 : 4;
  } else if (placement === 3) {
    placementPoints = mode === 'ranked' ? 3 : mode === 'ranked_duo' ? 2 : 2;
  } else if (placement <= Math.ceil(totalPlayersInMatch * 0.25)) {
    placementPoints = 1; // Top 25% small comfort
  } else if (placement > Math.ceil(totalPlayersInMatch * 0.6)) {
    // Bottom 40%: harsh placement drop
    placementPoints = -8;
  } else {
    // Mid placement
    placementPoints = -3;
  }

  // Kill points: capped tightly (max 4-6 points)
  const killRate = mode === 'ranked' ? 1.5 : 1.0;
  const killBonus = Math.min(6, Math.floor(kills * killRate));

  // Net calculation
  let rawChange = placementPoints + killBonus - entryFee;

  // Protect Beginner from dropping below 0
  if (tier === 'Beginner' && rawChange < 0 && currentPoints + rawChange < 0) {
    rawChange = -currentPoints;
  }

  return {
    ratingChange: rawChange,
    placementPoints,
    killBonus,
    entryFee,
    isWin,
    finalPlacement: placement,
  };
}

/**
 * Monthly Season Info and Countdown (Reset on 1st of every month at 00:00:00)
 */
export interface CurrentSeasonDetails {
  seasonId: string; // e.g. "2026-10"
  seasonName: string; // e.g. "2026年10月シーズン"
  startsAt: Date;
  endsAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  secondsRemaining: number;
  formattedCountdown: string;
}

export function getCurrentMonthlySeason(): CurrentSeasonDetails {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11 (0=Jan, 9=Oct)
  
  const seasonId = `${year}-${String(month + 1).padStart(2, '0')}`;
  const seasonName = `${year}年${month + 1}月シーズン`;
  const startsAt = new Date(year, month, 1, 0, 0, 0);
  const nextMonthFirst = new Date(year, month + 1, 1, 0, 0, 0);

  const diffMs = Math.max(0, nextMonthFirst.getTime() - now.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formattedCountdown = `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;

  return {
    seasonId,
    seasonName,
    startsAt,
    endsAt: nextMonthFirst,
    daysRemaining: days,
    hoursRemaining: hours,
    minutesRemaining: minutes,
    secondsRemaining: seconds,
    formattedCountdown,
  };
}

/**
 * Soft Reset calculation for Season Reset
 */
export function calculateSeasonSoftReset(points: number): number {
  if (points <= 200) return 0; // Beginner resets to 0
  if (points < 800) return 200; // Bronze/Silver resets to 200 (Bronze floor)
  if (points < 1800) return 450; // Gold/Plat resets to 450 (Silver floor)
  if (points < 3300) return 800; // Diamond/Master resets to 800 (Gold floor)
  return 1250; // GrandMaster/God resets to 1250 (Platinum floor)
}
