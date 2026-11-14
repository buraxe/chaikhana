import { crosswordDef } from './defs';
import { WordGame } from './WordGame';
export default function Crossword() { return <WordGame game="crossword" make={l => crosswordDef(l === 'tr' ? 'tr' : 'en')} langs={['tr', 'en']} />; }
