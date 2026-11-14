# Chaikhana

A Silk Road teahouse of puzzles and board games, in English, Turkish and Chinese. The name is the
teahouse itself: *çayhane* in Istanbul, *chaikhana* across Central Asia, 茶馆 in China.

More than fifty games in one browser app:

- **Board games** – chess, xiangqi, shogi, weiqi, tavla, dama, reversi, gomoku, mancala and more, against fifteen computer regulars at five strengths.
- **Tables** – mahjong, okey, okey 101, pişti, batak, king, Texas hold’em, and Saranta’s own Sì Fēng.
- **Logic puzzles** – sudoku, KenKen, kakuro, futoshiki, binary, slitherlink, hidato, numberlink, queens, nonograms, hashi and others, all generated with a single solution.
- **3D puzzles** – Lu Ban and Kongming locks, burrs, the Soma cube, packing and assembly puzzles, the snake cube, Rubik’s cube.
- **Chinese classics** – huarong pass, tangram, the nine linked rings.
- **The rest of the house** – a daily gazette with jobs and a streak, tea glasses to spend in the coffeehouse, clippings, local tournaments, lessons and tutorials for every game.

## Development

```sh
npm install
npm run dev        # local dev server
npm test           # vitest: rules, solvers, generators
npm run typecheck
npm run build      # split build → dist-split/chaikhana.html + dist-split/app/*
npm run build:single   # everything in one file → dist/chaikhana.html
```

Each game lives in `src/games/<game>/` with its rules, screen, styles and lesson. Shared pieces are in
`src/core/` (store, i18n, sound, daily issue, the regulars, the 3D engine) and `src/ui/`.

Some content is generated offline and checked in as JSON:

- board-game puzzles: `npx vite-node scripts/puzzles.ts` (or `ONLY=chess …` for one pool)
- Lu Ban locks and burrs: `GEN=1 npx vitest run src/games/luban/gen.test.ts`
- packing boxes and assembly figures: `GEN=1 npx vitest run src/games/soma/sets.gen.test.ts`

three.js is loaded from a CDN the first time a 3D game opens.

## Publishing

Every push to `main` builds the site and publishes it to GitHub Pages
(`.github/workflows/pages.yml`). In the repository settings, Pages → Build and deployment →
Source must be set to **GitHub Actions**; serving the branch directly shows a blank page,
because the source `index.html` needs the build step.
