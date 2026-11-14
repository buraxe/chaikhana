# The Workshop

Players build their own games and puzzles in the Workshop (`#workshop`) and publish them to
**From you** (`#community`). This page describes the game format, how the parts fit together,
and the one interface a server has to provide.

## Files

| File | What it does |
| --- | --- |
| `src/maker/engine.ts` | The game format, the block tables (`EXPRS`, `ACTS`), the interpreter, legal moves, validation, rule tracing |
| `src/maker/ai.ts` | Computer player for any game (Monte Carlo tree search; hidden cards are reshuffled, never peeked at) |
| `src/maker/solver.ts` | Breadth-first solver for one-player puzzles: "can it be solved?" and hints |
| `src/maker/blocks.ts`, `blockText.ts` | Rules ⇄ Blockly blocks, block texts in English, Chinese and Turkish |
| `src/maker/BlockEditor.tsx` | The block editor (Blockly loads only when its tab opens) |
| `src/maker/MaterialsEditor.tsx` | Board painting, pieces, cards, zones, dice, counters, buttons, words |
| `src/maker/Player.tsx`, `GameView.tsx`, `WordBoard.tsx` | Playing a game: board, cards, dice, word grid and keyboard, seats, undo, hints |
| `src/maker/Watch.tsx` | Rule log and "why did nothing happen" panel |
| `src/maker/share.ts` | Share codes and links (`#workshop-g-<code>`) |
| `src/maker/community.ts` | **The server interface** for published games |
| `src/maker/Community.tsx` | The "From you" page (`#community`, `#community-<id>`) |
| `src/maker/examples.ts` | Eleven examples, one or more for every feature |

## The game format

A game is one JSON object (`GameDef`). Nothing in it runs as code: every block is
interpreted by the engine, so a game from a stranger is safe to open.

```jsonc
{
  "format": "chaikhana-game", "version": 1,
  "id": "my-game", "name": { "en": "…", "zh": "…", "tr": "…" },  // or a plain string
  "kind": "game",                         // or "puzzle" (one player)
  "players": { "min": 2, "max": 4, "colors": ["#c0392b", "…"] },
  "turns": "auto",                        // pass after each action, or "manual"
  "board":  { "w": 8, "h": 8, "grid": "square", "checker": true,
              "types": { "trap": { "name": "Trap", "color": "#e8b0a0" } },
              "marks": [{ "cell": 12, "type": "trap", "props": { "to": 3 } }],
              "path": "snake", "showPath": true, "links": true },
  "pieces": { "stone": { "name": "Stone", "shape": "disc" } },
  "cards":  { "fields": { "color": ["red", "blue"], "n": [1, 2, 3] }, "copies": 2, "label": "{n}",
              "color": { "field": "color", "map": { "red": "#d0342c", "blue": "#2a62c9" } } },
  "zones":  { "deck": { "name": "Deck", "owner": "shared", "show": "count" },
              "hand": { "name": "Hand", "owner": "each",   "show": "owner" } },
  "dice":   { "count": 2, "faces": 6 },
  "vars":   { "score": { "name": "Score", "per": "player", "init": 0, "show": true } },
  "buttons":{ "pass": { "name": "Pass" } },
  "words":  { "mode": "guess", "list": ["kalem", "…"], "length": 5, "rows": 6, "locale": "tr", "alphabet": "ERTYUIOPĞÜ ASDFGHJKLŞİ ZCVBNMÖÇ" },
  "rules": [
    { "on": "click", "when": { "op": "empty", "cell": { "op": "get", "name": "cell" } },
      "do": [ { "op": "place", "piece": "stone", "cell": { "op": "get", "name": "cell" } } ] }
  ]
}
```

**Word puzzles** come in four kinds (`words.mode`), each with its own generator and screen:

| mode | what it is | key blocks |
| --- | --- | --- |
| `guess` | Wordle: a secret word, guesses marked green / yellow / grey | `pickWord`, `addGuess`, `secret`, `guesses`, `inList` |
| `anagram` | unscramble the secret; `clues` give a hint | `pickWord`, `secret` |
| `search` | words hidden in a grid (`size`, `count`, `diagonal`, `backwards`, optional themed `groups`) | `buildPuzzle`, `placed`, `markFound`, `found`, `total` |
| `cross` | a crossword built from the clued words (`clues`, `size`, `count`); typing needs no rule | `buildPuzzle`, `crossDone`, `reveals` |

`buildPuzzle` draws a new puzzle from the list every game. The generators are in `src/maker/wordgen.ts`. The site's own word games (Crossword, Word Search, Word Guess, Anagrams in `src/games/words/`) are workshop definitions built from the banks next to them.

**Rules** are "when this happens, if that holds, do these". Events: `start`, `turn`, `click`,
`move`, `roll`, `card`, `zone`, `button`, `enter` (a piece lands on a cell), `after` (every
action), `blocked` (nobody can move), `word` (a typed guess). Each rule may filter by
`cellType`, `zone`, `button`, `target: "cell"` (a card played onto the board), and for moves
`reach` and `anyPiece`.

**Blocks**: every expression and action, with its inputs, is listed in `EXPRS` and `ACTS` in
`engine.ts`. The block editor, validation and the block texts are all generated from those
tables, so a new block is added in one place (plus its three texts in `blockText.ts`).

`validate(def)` returns readable problems; an empty list means the game can be played.

## Plugging in a server

Everything about published games goes through one object:

```ts
import { setCommunityBackend, type CommunityBackend } from './maker/community';

const myServer: CommunityBackend = {
  shared: true,                                  // published games reach other people
  async list() { /* GET /games  → CommunityEntry[] (newest first) */ },
  async get(id) { /* GET /games/:id → CommunityEntry | null */ },
  async publish(def, { author, note }) { /* POST /games → CommunityEntry (with its id) */ },
  async unpublish(id) { /* DELETE /games/:id */ },
  async recordPlay(id) { /* optional: POST /games/:id/plays */ },
};
setCommunityBackend(myServer);                   // e.g. in src/main.tsx
```

A `CommunityEntry` is `{ id, def, author, note?, publishedAt, plays? }`. Until a backend is
set, the built-in `localBackend` keeps published games in this browser only, and the pages
say so.

What the server should do:

- **Validate** every submitted `def` with `validate()` from `engine.ts` (it runs fine in
  Node) and reject games with problems.
- **Limit size**: a typical game is 2–10 KB of JSON; refusing anything over ~200 KB is safe.
- **Moderate**: names, notes, card labels and words are free text written by players.
- **Choose ids** that are URL-safe (letters, digits, hyphens): they appear as `#community-<id>`.
- Treat the definition as data only. It never needs to be executed on the server.

## Sharing without a server

`Share` turns a game into a compressed code (`deflate-raw` + base64url). A link of the form
`https://buraxe.github.io/chaikhana/#workshop-g-<code>` adds the game to whoever opens it;
the code can also be pasted into the Workshop.
