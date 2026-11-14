import { searchDef } from './defs';
import { WordGame } from './WordGame';
export default function WordSearch() { return <WordGame game="word-search" make={searchDef} langs={['tr', 'en', 'zh']} />; }
