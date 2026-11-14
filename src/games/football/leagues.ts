/** League and cup names, kept apart from the squads so the newspaper can name them cheaply. */
export type LeagueId = 'giants' | 'tr' | 'cn';
export const LEAGUE_NAMES: Record<LeagueId, { name: [string, string, string]; cup: [string, string, string] }> = {
  giants: { name: ['Giants League', '巨人联赛', 'Devler Ligi'], cup: ['Giants Cup', '巨人杯', 'Devler Kupası'] },
  tr: { name: ['Anatolian League', '安纳托利亚联赛', 'Anadolu Ligi'], cup: ['Anatolian Cup', '安纳托利亚杯', 'Anadolu Kupası'] },
  cn: { name: ['Eastern League', '东方联赛', 'Doğu Ligi'], cup: ['Eastern Cup', '东方杯', 'Doğu Kupası'] },
};
