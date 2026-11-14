/** League and cup names, kept apart from the squads so the newspaper can name them cheaply. */
export type LeagueId = 'giants' | 'tr' | 'cn';
export const LEAGUE_NAMES: Record<LeagueId, { name: [string, string, string]; cup: [string, string, string] }> = {
  giants: { name: ['European Giants League', '欧洲豪门联赛', 'Avrupa Devler Ligi'], cup: ['Giants Cup', '豪门杯', 'Devler Kupası'] },
  tr: { name: ['Turkish Super League', '土耳其超级联赛', 'Türkiye Süper Ligi'], cup: ['Turkish Cup', '土耳其杯', 'Türkiye Kupası'] },
  cn: { name: ['Chinese Super League', '中国超级联赛', 'Çin Süper Ligi'], cup: ['FA Cup of China', '中国足协杯', 'Çin Federasyon Kupası'] },
};
