/** Looks that tea glasses buy. They change how things look, never how a game plays. */
export type Slot = 'wall' | 'tavla' | 'tiles' | 'felt';
export interface Item { id: string; slot: Slot; price: number; name: [string, string, string]; swatch: string[] }
export const ITEMS: Item[] = [
  { id: 'wall-walnut', slot: 'wall', price: 0, name: ['Walnut panels', '胡桃木墙板', 'Ceviz lambri'], swatch: ['#6a4326', '#5a371e', '#482a15'] },
  { id: 'wall-tile', slot: 'wall', price: 60, name: ['Iznik tiles', '伊兹尼克瓷砖', 'İznik çinisi'], swatch: ['#1f5a6e', '#174a5b', '#103a48'] },
  { id: 'wall-oxblood', slot: 'wall', price: 50, name: ['Oxblood velvet', '酒红丝绒', 'Bordo kadife'], swatch: ['#5e1d1d', '#4f1717', '#3f1111'] },
  { id: 'wall-olive', slot: 'wall', price: 40, name: ['Olive grove', '橄榄林', 'Zeytinlik'], swatch: ['#4a4f2a', '#3d4222', '#30351a'] },
  { id: 'wall-night', slot: 'wall', price: 80, name: ['Bosphorus night', '博斯普鲁斯之夜', 'Boğaz gecesi'], swatch: ['#1c2440', '#161d36', '#10162a'] },
  { id: 'tavla-classic', slot: 'tavla', price: 0, name: ['Classic walnut', '经典胡桃木', 'Klasik ceviz'], swatch: ['#4a2a12', '#2c4a3a', '#d8c49a', '#8a2f24'] },
  { id: 'tavla-sedef', slot: 'tavla', price: 150, name: ['Mother-of-pearl', '螺钿', 'Sedef kakma'], swatch: ['#3b2a20', '#e9e2d2', '#b9a37a', '#2f5a66'] },
  { id: 'tavla-ebony', slot: 'tavla', price: 90, name: ['Ebony', '乌木', 'Abanoz'], swatch: ['#18120e', '#22303f', '#e6dcc4', '#b8892e'] },
  { id: 'tavla-olive', slot: 'tavla', price: 60, name: ['Olive wood', '橄榄木', 'Zeytin ağacı'], swatch: ['#6b5a34', '#4b5a2a', '#efe3c0', '#7a3b1f'] },
  { id: 'tiles-ivory', slot: 'tiles', price: 0, name: ['Ivory', '象牙白', 'Fildişi'], swatch: ['#fbf6e9', '#ece2c8'] },
  { id: 'tiles-mint', slot: 'tiles', price: 50, name: ['Mint', '薄荷绿', 'Nane yeşili'], swatch: ['#eef7f1', '#cfe6d8'] },
  { id: 'tiles-rose', slot: 'tiles', price: 50, name: ['Rose', '玫瑰粉', 'Gül kurusu'], swatch: ['#fbeeee', '#ecd1cf'] },
  { id: 'tiles-night', slot: 'tiles', price: 90, name: ['Midnight', '午夜黑', 'Gece siyahı'], swatch: ['#2a2a30', '#17171c'] },
  { id: 'felt-purple', slot: 'felt', price: 40, name: ['Royal purple', '皇家紫', 'Kraliyet moru'], swatch: ['#5b2c83', '#47216a'] },
  { id: 'felt-teal', slot: 'felt', price: 40, name: ['Teal', '青绿', 'Petrol'], swatch: ['#1d6f6c', '#155956'] },
  { id: 'felt-black', slot: 'felt', price: 70, name: ['Black tie', '黑色礼服', 'Siyah smokin'], swatch: ['#26262b', '#18181c'] },
];
export const itemOf = (id: string) => ITEMS.find(i => i.id === id);
export const DEFAULT_EQUIP: Record<Exclude<Slot, 'felt'>, string> = { wall: 'wall-walnut', tavla: 'tavla-classic', tiles: 'tiles-ivory' };
