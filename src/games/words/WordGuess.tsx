import { wordleDef } from './defs';
import { WordGame } from './WordGame';
export default function WordGuess() { return <WordGame game="wordle" make={l => wordleDef(l === 'tr' ? 'tr' : 'en')} langs={['tr', 'en']} />; }
