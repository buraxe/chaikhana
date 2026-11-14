import type { Act, Expr, GameDef, Mark } from './engine';

/** Small builders so the examples read like the blocks they will become. The output is plain JSON. */
const o = (op: string, args: Record<string, unknown> = {}) => ({ op, ...args });
const get = (name: string) => o('get', { name });
const cell = get('cell'), from = get('from'), to = get('to');
const eq = (a: Expr, b: Expr) => o('eq', { a, b }), and = (a: Expr, b: Expr) => o('and', { a, b }), or = (a: Expr, b: Expr) => o('or', { a, b });
const iff = (test: Expr, then: Act[], els?: Act[]): Act => o('if', els ? { test, then, else: els } : { test, then });

const PLAYERS2 = { min: 2, max: 2, colors: ['#c0392b', '#1f4e9c'] };

export const TICTACTOE: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-xox', kind: 'game',
  name: { en: 'Tic-tac-toe', zh: '井字棋', tr: 'XOX' },
  about: { en: 'The smallest example: click an empty cell to place a stone, three in a row wins.', zh: '最小的例子：点空格落子，连成三个就赢。', tr: 'En küçük örnek: boş kareye tıkla, taş koy; üç tane yan yana getiren kazanır.' },
  players: PLAYERS2,
  board: { w: 3, h: 3 },
  pieces: { stone: { name: { en: 'Stone', zh: '棋子', tr: 'Taş' }, shape: 'disc' } },
  rules: [
    { on: 'click', name: { en: 'Place a stone', zh: '落子', tr: 'Taş koy' }, when: o('empty', { cell }), do: [
      o('place', { piece: 'stone', cell }),
      iff(o('line', { cell, n: 3 }), [o('win')]),
    ] },
    { on: 'after', name: { en: 'Full board is a draw', zh: '下满为和', tr: 'Tahta dolarsa berabere' }, when: o('full'), do: [o('draw')] },
  ],
};

export const CONNECT4: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-c4', kind: 'game',
  name: { en: 'Four in a row', zh: '四子连珠', tr: 'Dört Bağla' },
  about: { en: 'Click any column: the disc falls to the lowest empty cell. Four in a line wins.', zh: '点任意一列，棋子落到最低的空格。连成四个就赢。', tr: 'Bir sütuna tıkla, pul en alttaki boş kareye düşer. Dördü bir sıraya getiren kazanır.' },
  players: { min: 2, max: 2, colors: ['#c0392b', '#e0b020'] },
  board: { w: 7, h: 6 },
  pieces: { disc: { name: { en: 'Disc', zh: '圆片', tr: 'Pul' }, shape: 'disc' } },
  rules: [
    { on: 'click', name: { en: 'Drop a disc', zh: '投子', tr: 'Pul at' }, when: o('ge', { a: o('lowest', { col: o('col', { cell }) }), b: 0 }), do: [
      o('let', { name: 'spot', value: o('lowest', { col: o('col', { cell }) }) }),
      o('place', { piece: 'disc', cell: get('spot') }),
      iff(o('line', { cell: get('spot'), n: 4 }), [o('win')]),
    ] },
    { on: 'after', when: o('full'), do: [o('draw')] },
  ],
};

/** Snakes and ladders on squares 1–100, numbered from the bottom left. */
const sq = (n: number) => { const p = n - 1, r = 9 - Math.floor(p / 10), c = Math.floor(p / 10) % 2 ? 9 - (p % 10) : p % 10; return r * 10 + c; };
const LADDERS: [number, number][] = [[4, 14], [9, 31], [21, 42], [28, 84], [36, 44], [51, 67], [71, 91], [80, 100]];
const SNAKES: [number, number][] = [[16, 6], [47, 26], [49, 11], [56, 53], [62, 19], [64, 60], [87, 24], [93, 73], [95, 75], [98, 78]];
const slide = (type: string) => ([a, b]: [number, number]): Mark => ({ cell: sq(a), type, props: { to: sq(b) } });

export const SNAKES_LADDERS: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-snakes', kind: 'game',
  name: { en: 'Snakes and ladders', zh: '蛇梯棋', tr: 'Yılan ve Merdiven' },
  about: { en: 'Dice, a race track and cells with their own rules: land on a ladder and climb, land on a snake and slide. A six rolls again.', zh: '骰子、赛道，以及有自己规则的格子：停在梯子上就爬上去，停在蛇头就滑下来。掷出六点再掷一次。', tr: 'Zar, yarış yolu ve kendi kuralı olan kareler: merdivene gelen tırmanır, yılana gelen kayar. Altı atan tekrar atar.' },
  players: { min: 2, max: 4, colors: ['#c0392b', '#1f4e9c', '#1e7a4a', '#e0a020'] },
  board: {
    w: 10, h: 10, checker: true, path: 'snake', showPath: true, links: true,
    types: { ladder: { name: { en: 'Ladder', zh: '梯子', tr: 'Merdiven' }, color: '#b8d8a8' }, snake: { name: { en: 'Snake', zh: '蛇', tr: 'Yılan' }, color: '#e8b0a0' } },
    marks: [...LADDERS.map(slide('ladder')), ...SNAKES.map(slide('snake'))],
  },
  pieces: { pawn: { name: { en: 'Pawn', zh: '棋子', tr: 'Piyon' }, shape: 'pawn' } },
  dice: { count: 1, faces: 6 },
  rules: [
    { on: 'start', name: { en: 'Everyone starts on square 1', zh: '大家从第1格出发', tr: 'Herkes 1. kareden başlar' }, do: [o('forPlayers', { do: [o('place', { piece: 'pawn', cell: o('pathCell', { pos: 0 }), owner: get('p') })] })] },
    { on: 'roll', name: { en: 'Roll and move', zh: '掷骰前进', tr: 'Zar at ve ilerle' }, when: o('not', { a: o('rolled') }), do: [
      o('roll'),
      o('let', { name: 'at', value: o('find', { piece: 'pawn' }) }),
      o('let', { name: 'goal', value: o('add', { a: o('pathPos', { cell: get('at') }), b: o('sum') }) }),
      iff(o('lt', { a: get('goal'), b: o('pathLen') }),
        [o('move', { from: get('at'), to: o('pathCell', { pos: get('goal') }), owner: o('me') })],
        [o('say', { text: { en: 'Too far: you must land exactly on 100.', zh: '超过了：必须正好走到100。', tr: 'Fazla: tam 100’e gelmelisin.' } })]),
      iff(eq(o('find', { piece: 'pawn' }), o('pathCell', { pos: o('sub', { a: o('pathLen'), b: 1 }) })), [o('win')]),
      iff(eq(o('die', { i: 0 }), 6), [o('again')]),
    ] },
    { on: 'enter', cellType: 'ladder', name: { en: 'Climb the ladder', zh: '爬梯子', tr: 'Merdivenden çık' }, do: [o('move', { from: cell, to: o('prop', { cell, name: 'to' }), owner: get('who') }), o('say', { text: { en: 'A ladder!', zh: '梯子！', tr: 'Merdiven!' } })] },
    { on: 'enter', cellType: 'snake', name: { en: 'Slide down the snake', zh: '顺着蛇滑下', tr: 'Yılandan kay' }, do: [o('move', { from: cell, to: o('prop', { cell, name: 'to' }), owner: get('who') }), o('say', { text: { en: 'A snake…', zh: '蛇……', tr: 'Yılan…' } })] },
  ],
};

/** The English peg solitaire cross: 33 holes, every one filled but the centre. */
const corners = [0, 1, 5, 6, 7, 8, 12, 13, 35, 36, 40, 41, 42, 43, 47, 48];
export const PEG: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-peg', kind: 'puzzle',
  name: { en: 'Peg solitaire', zh: '孔明棋', tr: 'Tek Taş' },
  about: { en: 'A one-player puzzle with moves from one cell to another: jump a peg over its neighbour into an empty hole and take the jumped peg. Leave just one.', zh: '单人谜题，棋子从一格移到另一格：跳过相邻的棋子落入空孔，并拿走被跳过的棋子。最后只剩一颗。', tr: 'Bir hücreden ötekine hamleyle oynanan tek kişilik bulmaca: bir taşı komşusunun üstünden boş deliğe atla, atlanan taşı al. Tek taş bırak.' },
  players: { min: 1, max: 1, colors: ['#8a5a2b'] },
  board: { w: 7, h: 7, marks: corners.map(cell => ({ cell, type: '#' })) },
  pieces: { peg: { name: { en: 'Peg', zh: '棋子', tr: 'Taş' }, shape: 'disc' } },
  rules: [
    { on: 'start', do: [o('forCells', { where: o('ne', { a: get('it'), b: 24 }), do: [o('place', { piece: 'peg', cell: get('it') })] })] },
    { on: 'move', reach: 2, name: { en: 'Jump and take', zh: '跳吃', tr: 'Atla ve al' },
      when: and(and(eq(o('owner', { cell: from }), o('me')), o('empty', { cell: to })),
        and(or(eq(o('dr', { a: from, b: to }), 0), eq(o('dc', { a: from, b: to }), 0)),
          and(o('ge', { a: o('between', { a: from, b: to }), b: 0 }), o('not', { a: o('empty', { cell: o('between', { a: from, b: to }) }) })))),
      do: [o('move', { from, to }), o('remove', { cell: o('between', { a: from, b: to }) })] },
    { on: 'after', name: { en: 'One peg left: solved', zh: '只剩一颗：完成', tr: 'Tek taş kaldı: çözüldü' }, when: eq(o('count', { piece: 'peg' }), 1), do: [o('win')] },
  ],
};

export const COLOR_NUMBER: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-color', kind: 'game',
  name: { en: 'Colour or number', zh: '同色或同数', tr: 'Renk ya da Sayı' },
  about: { en: 'A card game with no board: a deck made from two fields (four colours × 1–9, twice). Play a card that matches the top of the pile in colour or number, or draw. Empty your hand to win.', zh: '没有棋盘的纸牌游戏：牌由两个字段组合而成（四种颜色 × 1–9，各两张）。打出与牌堆顶同色或同数的牌，否则摸牌。先出完手牌者胜。', tr: 'Tahtasız bir kart oyunu: deste iki alanın birleşiminden oluşur (dört renk × 1–9, ikişer). Yığının üstüyle aynı renkte ya da sayıda bir kart oyna ya da çek. Elini bitiren kazanır.' },
  players: { min: 2, max: 4, colors: ['#c0392b', '#1f4e9c', '#1e7a4a', '#e0a020'] },
  cards: {
    fields: { color: ['red', 'yellow', 'green', 'blue'], n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, copies: 2, label: '{n}',
    color: { field: 'color', map: { red: '#d0342c', yellow: '#e6b31e', green: '#2f8f4e', blue: '#2a62c9' } },
  },
  zones: {
    deck: { name: { en: 'Deck', zh: '牌堆', tr: 'Deste' }, owner: 'shared', show: 'count' },
    pile: { name: { en: 'Pile', zh: '弃牌', tr: 'Yığın' }, owner: 'shared', show: 'top' },
    hand: { name: { en: 'Hand', zh: '手牌', tr: 'El' }, owner: 'each', show: 'owner' },
  },
  rules: [
    { on: 'start', name: { en: 'Shuffle and deal seven each', zh: '洗牌，每人发七张', tr: 'Karıştır, herkese yedi dağıt' }, do: [
      o('fill', { zone: 'deck' }), o('deal', { from: 'deck', to: 'hand', count: 7, each: true }), o('deal', { from: 'deck', to: 'pile' }),
    ] },
    { on: 'card', zone: 'hand', name: { en: 'Play a matching card', zh: '出同色或同数的牌', tr: 'Uyan kartı oyna' },
      when: or(eq(o('field', { card: get('card'), name: 'color' }), o('field', { card: o('top', { zone: 'pile' }), name: 'color' })),
        eq(o('field', { card: get('card'), name: 'n' }), o('field', { card: o('top', { zone: 'pile' }), name: 'n' }))),
      do: [o('moveCard', { card: get('card'), to: 'pile' }), iff(eq(o('size', { zone: 'hand' }), 0), [o('win')])] },
    { on: 'zone', zone: 'deck', name: { en: 'Draw a card', zh: '摸一张', tr: 'Kart çek' }, when: o('gt', { a: o('size', { zone: 'deck' }), b: 0 }), do: [o('deal', { from: 'deck', to: 'hand' })] },
  ],
};

const dir = get('dir'), me = o('me');
export const REVERSI: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-reversi', kind: 'game',
  name: { en: 'Reversi', zh: '黑白棋', tr: 'Reversi' },
  about: { en: 'Directions and loops: a stone must close a line of enemy stones in at least one of the eight directions, and every closed line flips. When nobody can move, the most stones wins.', zh: '方向与循环：落子必须在八个方向中至少一个方向夹住对方的棋子，被夹住的都翻过来。双方都无法落子时，棋子多者胜。', tr: 'Yönler ve döngüler: taş, sekiz yönden en az birinde rakip taşlardan bir sırayı kapatmalı; kapanan her sıra döner. Kimse oynayamayınca taşı çok olan kazanır.' },
  players: { min: 2, max: 2, colors: ['#1d1a17', '#f4efe2'], names: [{ en: 'Black', zh: '黑方', tr: 'Siyah' }, { en: 'White', zh: '白方', tr: 'Beyaz' }] },
  board: { w: 8, h: 8, types: {}, marks: [] },
  pieces: { stone: { name: { en: 'Stone', zh: '棋子', tr: 'Taş' }, shape: 'disc' } },
  rules: [
    { on: 'start', do: [o('place', { piece: 'stone', cell: 27, owner: 1 }), o('place', { piece: 'stone', cell: 36, owner: 1 }), o('place', { piece: 'stone', cell: 28, owner: 0 }), o('place', { piece: 'stone', cell: 35, owner: 0 })] },
    { on: 'click', name: { en: 'Place and flip', zh: '落子翻转', tr: 'Koy ve çevir' },
      when: and(o('empty', { cell }), o('anyDir', { test: o('gt', { a: o('flank', { cell, dir }), b: 0 }) })),
      do: [
        o('forDirs', { do: [
          o('let', { name: 'k', value: o('flank', { cell, dir }) }),
          o('repeat', { times: get('k'), do: [o('setOwner', { cell: o('step', { cell, dir, n: get('i') }), owner: me })] }),
        ] }),
        o('place', { piece: 'stone', cell }),
      ] },
    { on: 'after', when: o('full'), do: [o('winBest', { score: o('count', { piece: 'stone', owner: get('p') }) })] },
    { on: 'blocked', name: { en: 'Nobody can move: count the stones', zh: '无人可下：数子', tr: 'Kimse oynayamıyor: taşları say' }, do: [o('winBest', { score: o('count', { piece: 'stone', owner: get('p') }) })] },
  ],
};

const hexEdges: Mark[] = [];
for (let i = 0; i < 49; i++) { const r = Math.floor(i / 7), c = i % 7; if (r === 0 || r === 6) hexEdges.push({ cell: i, type: 'red' }); else if (c === 0 || c === 6) hexEdges.push({ cell: i, type: 'blue' }); }
export const HEX: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-hex', kind: 'game',
  name: { en: 'Hex', zh: '六贯棋', tr: 'Hex' },
  about: { en: 'A hexagon board and a connection test: red joins the top and bottom edges, blue the left and right. There are no draws.', zh: '六边形棋盘和连通检查：红方连接上下两边，蓝方连接左右两边。不会有和棋。', tr: 'Altıgen tahta ve bağlantı kontrolü: kırmızı üst ve alt kenarı, mavi sol ve sağ kenarı birleştirir. Beraberlik olmaz.' },
  players: { min: 2, max: 2, colors: ['#c0392b', '#1f4e9c'], names: [{ en: 'Red', zh: '红方', tr: 'Kırmızı' }, { en: 'Blue', zh: '蓝方', tr: 'Mavi' }] },
  board: { w: 7, h: 7, grid: 'hex', types: { red: { name: { en: 'Red edge', zh: '红边', tr: 'Kırmızı kenar' }, color: '#eec3bb' }, blue: { name: { en: 'Blue edge', zh: '蓝边', tr: 'Mavi kenar' }, color: '#bfcdea' } }, marks: hexEdges },
  pieces: { stone: { name: { en: 'Stone', zh: '棋子', tr: 'Taş' }, shape: 'disc' } },
  rules: [
    { on: 'click', name: { en: 'Place a stone', zh: '落子', tr: 'Taş koy' }, when: o('empty', { cell }), do: [
      o('place', { piece: 'stone', cell }),
      iff(eq(me, 0), [iff(o('connects', { owner: me, a: 'top', b: 'bottom' }), [o('win')])], [iff(o('connects', { owner: me, a: 'left', b: 'right' }), [o('win')])]),
    ] },
  ],
};

export const CARD_DUEL: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-duel', kind: 'game',
  name: { en: 'Card duel', zh: '卡牌对决', tr: 'Kart Düellosu' },
  about: { en: 'Cards played onto the board: pick a card from your hand, then an empty cell. It becomes a tile with the card’s number and captures each neighbouring enemy tile with a lower number. When the board is full, the most tiles wins.', zh: '把牌打到棋盘上：先选手里的一张牌，再选一个空格。它变成带有牌面数字的方块，并吃掉相邻的、数字更小的对方方块。棋盘填满时，方块多者胜。', tr: 'Tahtaya oynanan kartlar: elinden bir kart seç, sonra boş bir kare. Kart, üzerindeki sayıyla bir taşa dönüşür ve komşu rakip taşlardan sayısı küçük olanları ele geçirir. Tahta dolunca taşı çok olan kazanır.' },
  players: PLAYERS2,
  board: { w: 3, h: 3, checker: true },
  pieces: { tile: { name: { en: 'Tile', zh: '方块', tr: 'Taş' }, shape: 'square' } },
  cards: { fields: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, copies: 2, label: '{n}' },
  zones: {
    deck: { name: { en: 'Deck', zh: '牌堆', tr: 'Deste' }, owner: 'shared', show: 'count' },
    hand: { name: { en: 'Hand', zh: '手牌', tr: 'El' }, owner: 'each', show: 'all' },
    used: { name: { en: 'Played', zh: '已出', tr: 'Oynanan' }, owner: 'shared', show: 'count' },
  },
  rules: [
    { on: 'start', do: [o('fill', { zone: 'deck' }), o('deal', { from: 'deck', to: 'hand', count: 5, each: true })] },
    { on: 'card', zone: 'hand', target: 'cell', name: { en: 'Play a card onto a cell', zh: '把牌打到格子上', tr: 'Kartı kareye oyna' }, when: o('empty', { cell }), do: [
      o('place', { piece: 'tile', cell, value: o('field', { card: get('card'), name: 'n' }) }),
      o('moveCard', { card: get('card'), to: 'used' }),
      o('forDirs', { orth: true, do: [
        o('let', { name: 'nb', value: o('step', { cell, dir }) }),
        iff(and(eq(o('owner', { cell: get('nb') }), o('next')), o('gt', { a: o('value', { cell }), b: o('value', { cell: get('nb') }) })), [o('setOwner', { cell: get('nb'), owner: me })]),
      ] }),
    ] },
    { on: 'after', when: o('full'), do: [o('winBest', { score: o('count', { piece: 'tile', owner: get('p') }) })] },
  ],
};

/** Lights out: every press flips a light and its four neighbours. Small enough for the solver to give hints. */
export const LIGHTS: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-lights', kind: 'puzzle',
  name: { en: 'Lights out', zh: '关灯', tr: 'Işıkları Söndür' },
  about: { en: 'A puzzle for the solver: pressing a cell switches it and its four neighbours. Turn every light off. Ask for a hint, or check whether it can be solved.', zh: '适合求解器的谜题：按一个格子会切换它和上下左右四格。把所有灯关掉。可以要提示，或检查是否有解。', tr: 'Çözücüye uygun bir bulmaca: bir kareye basmak onu ve dört komşusunu değiştirir. Bütün ışıkları söndür. İpucu iste ya da çözülebilir mi diye kontrol et.' },
  players: { min: 1, max: 1 },
  board: { w: 3, h: 3 },
  pieces: { light: { name: { en: 'Light', zh: '灯', tr: 'Işık' }, shape: 'disc', color: '#f2c14e' } },
  rules: [
    { on: 'start', do: [1, 3, 4, 5, 6].map(c => o('place', { piece: 'light', cell: c })) },
    { on: 'click', name: { en: 'Flip it and its neighbours', zh: '切换它和邻格', tr: 'Kendisini ve komşularını çevir' }, do: [
      iff(o('empty', { cell }), [o('place', { piece: 'light', cell })], [o('remove', { cell })]),
      o('forDirs', { orth: true, do: [
        o('let', { name: 'n', value: o('step', { cell, dir }) }),
        iff(o('ge', { a: get('n'), b: 0 }), [iff(o('empty', { cell: get('n') }), [o('place', { piece: 'light', cell: get('n') })], [o('remove', { cell: get('n') })])]),
      ] }),
    ] },
    { on: 'after', name: { en: 'All dark: solved', zh: '全灭：完成', tr: 'Hepsi söndü: çözüldü' }, when: eq(o('count', { piece: 'light' }), 0), do: [o('win')] },
  ],
};

const guess = get('guess');
const wordRules = (rows: number, mustBeWord: boolean) => [
  { on: 'start' as const, do: [o('pickWord')] },
  { on: 'word' as const, name: { en: 'Mark the guess', zh: '标出猜测', tr: 'Tahmini işaretle' },
    when: mustBeWord ? and(eq(o('len', { text: guess }), o('wordLen')), o('inList', { text: guess })) : eq(o('len', { text: guess }), o('wordLen')),
    do: [
      o('addGuess', { text: guess }),
      iff(eq(guess, o('secret')), [o('win')], [iff(o('ge', { a: o('guesses'), b: rows }), [o('lose')])]),
    ] },
];
const TR_WORDS = 'kalem kitap araba deniz güneş bulut çiçek elmas kavun kiraz armut limon biber soğan masal şarkı orman nehir köpek tavuk horoz koyun aslan karga serçe balık yunus martı çorba pilav ekmek tatlı şeker bahar gülüş sevgi hayat dünya insan çocuk bebek sınıf kağıt silgi dolap kapak perde yatak saksı tabak kaşık çatal bıçak kahve şehir köprü sokak meyve sebze mısır havuç incir kayık vapur taksi düdük zurna davul gitar keman roman resim fırça tuval sahne zaman hafta aylık sabah öğlen akşam karlı sisli sıcak soğuk serin temiz kirli güzel büyük küçük geniş derin alçak hızlı yavaş mutlu üzgün sakin cesur yeşil beyaz siyah'.split(' ');
const EN_WORDS = 'apple beach bread chair cloud dance dream earth field flame fruit ghost grape green heart horse house juice knife laugh lemon light magic money mouse music night ocean paint party peace piano plant queen quiet river robot salad sheep shirt smile snake sound space spoon sport stone storm sugar sweet table tiger toast train truth water whale world young zebra brave brick candy chess clock crown eagle flour glass honey lucky metal novel onion pearl pizza radio scarf shell skirt south north tooth tower uncle voice wheel woman youth bloom cabin coral frost globe jelly lunar maple olive pupil solar'.split(' ');

export const WORD_TR: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-word-tr', kind: 'puzzle',
  name: { en: 'Five letters (Turkish)', zh: '五个字母（土耳其语）', tr: 'Beş Harf' },
  about: { en: 'A word puzzle in Turkish: guess the five-letter word in six tries. Green is the right letter in the right place, yellow is in the word but elsewhere, grey is not in it.', zh: '土耳其语猜词：六次之内猜出五个字母的单词。绿色表示字母和位置都对，黄色表示单词里有这个字母但位置不对，灰色表示没有。', tr: 'Altı tahminde beş harfli kelimeyi bul. Yeşil: harf doğru yerde. Sarı: harf kelimede var ama başka yerde. Gri: harf kelimede yok.' },
  players: { min: 1, max: 1 },
  words: { list: TR_WORDS, length: 5, rows: 6, locale: 'tr', alphabet: 'ERTYUIOPĞÜ ASDFGHJKLŞİ ZCVBNMÖÇ' },
  rules: wordRules(6, false),
};
export const WORD_EN: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'ex-word-en', kind: 'puzzle',
  name: { en: 'Five letters', zh: '五个字母（英语）', tr: 'Five Letters (İngilizce)' },
  about: { en: 'Guess the five-letter English word in six tries; every guess must be in the word list. Green: right place. Yellow: elsewhere in the word. Grey: not in it.', zh: '六次之内猜出五个字母的英语单词，每次猜测都必须在词表里。绿色：位置正确。黄色：在单词里但位置不对。灰色：没有。', tr: 'Beş harfli İngilizce kelimeyi altı tahminde bul; her tahmin listede olmalı. Yeşil: doğru yer. Sarı: kelimede başka yerde. Gri: yok.' },
  players: { min: 1, max: 1 },
  words: { list: EN_WORDS, length: 5, rows: 6, locale: 'en', alphabet: 'QWERTYUIOP ASDFGHJKL ZXCVBNM' },
  rules: wordRules(6, true),
};

export const EXAMPLES: GameDef[] = [TICTACTOE, CONNECT4, SNAKES_LADDERS, PEG, COLOR_NUMBER, REVERSI, HEX, CARD_DUEL, LIGHTS, WORD_TR, WORD_EN];
