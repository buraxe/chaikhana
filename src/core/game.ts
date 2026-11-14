/**
 * The contract every game implements. Rules live here, with no rendering and no
 * storage, so the same module can drive the UI, an AI, tests, replays and — later —
 * a server that validates moves for online play.
 */
export interface GameResult {
  /** Seat index of the winner (0-based), or null for a draw / solved puzzle. */
  winner: number | null;
  draw: boolean;
  detail?: string;
}

export interface GameModule<S, M, C = void> {
  id: string;
  initializeGame(config: C): S;
  validateMove(state: S, move: M): boolean;
  applyMove(state: S, move: M): S;
  undoMove?(state: S): S;
  getLegalMoves?(state: S): M[];
  checkGameOver(state: S): boolean;
  calculateResult(state: S): GameResult | null;
  serializeState(state: S): string;
  deserializeState(raw: string): S;
}

export type Category = 'logic' | 'spatial' | 'chinese' | 'strategy' | 'tabletop' | 'cards' | 'classic';

export const CATEGORY_LABEL: Record<Category, { en: string; zh: string; tr: string }> = {
  logic: { en: 'Logic & number puzzles', zh: '逻辑与数字谜题', tr: 'Mantık ve sayı bulmacaları' },
  spatial: { en: '3D & mechanical puzzles', zh: '立体与机关谜题', tr: '3B ve mekanik bulmacalar' },
  chinese: { en: 'Traditional Chinese puzzles', zh: '中国传统智力游戏', tr: 'Geleneksel Çin bulmacaları' },
  strategy: { en: 'Strategy board games', zh: '策略棋类', tr: 'Strateji oyunları' },
  tabletop: { en: 'Turkish & Eastern tabletop', zh: '土耳其与东方桌游', tr: 'Türk ve Doğu masa oyunları' },
  cards: { en: 'Card games', zh: '纸牌游戏', tr: 'Kart oyunları' },
  classic: { en: 'Billiards & classics', zh: '台球与经典小游戏', tr: 'Bilardo ve klasikler' },
};

export interface GameMeta {
  id: string;
  name: string;
  zh: string;
  tr?: string;
  category: Category;
  players: [number, number];
  minutes: number;
  /** 1 casual, 2 moderate, 3 deep */
  depth: 1 | 2 | 3;
  tradition: 'traditional' | 'modern';
  dim: '2D' | '3D';
  phase: number;
  status: 'playable' | 'planned';
}

/**
 * Chance, per strength level, that the computer makes a casual move instead of its best one.
 * It keeps the lower levels human: they miss things now and then rather than playing
 * perfectly at a shallow depth.
 */
export const SLIP = [0.3, 0.18, 0.1, 0.05, 0.015];
