import { anagramDef } from './defs';
import { WordGame } from './WordGame';
export default function Anagram() { return <WordGame game="anagram" make={l => anagramDef(l === 'tr' ? 'tr' : 'en')} langs={['tr', 'en']} />; }
