/**
 * Minimal line drawings for the newspaper, one per game. Ink strokes (.k), ink fills (.f),
 * paper fills (.p) and a single red accent (.r); colours come from the paper's tokens.
 */
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const ART: Record<string, JSX.Element> = {
  sudoku: (
    <>
      <rect className="k w2" x="8" y="8" width="48" height="48" />
      {[24, 40].map(v => <path key={v} className="k w2" d={`M${v} 8v48M8 ${v}h48`} />)}
      {[13.3, 18.7, 29.3, 34.7, 45.3, 50.7].map(v => <path key={v} className="k w05" d={`M${v} 8v48M8 ${v}h48`} />)}
      <text className="t" x="16" y="22">5</text><text className="t" x="37.4" y="32.4">3</text>
      <text className="t r-t" x="26.6" y="48.4">7</text><text className="t" x="48" y="54">9</text>
    </>
  ),
  minesweeper: (
    <>
      {range(9).map(i => <rect key={i} className={'k ' + (i === 4 ? 'p' : 'sh')} x={10 + (i % 3) * 15} y={10 + Math.floor(i / 3) * 15} width="14" height="14" />)}
      <circle className="f" cx="32" cy="32" r="4" /><path className="k w15" d="M32 25.5v13M25.5 32h13M27.4 27.4l9.2 9.2M36.6 27.4l-9.2 9.2" />
      <path className="k w15" d="M17 52V40" /><path className="r" d="M17 40l7 3-7 3z" />
      <text className="t s" x="47" y="21">2</text>
    </>
  ),
  nonogram: (
    <>
      {range(25).map(i => {
        const r = Math.floor(i / 5), c = i % 5, on = ['01010', '11111', '11111', '01110', '00100'][r][c] === '1';
        return <rect key={i} className={on ? 'f' : 'k w05'} x={18 + c * 8} y={18 + r * 8} width="8" height="8" />;
      })}
      <text className="t xs" x="6" y="25">1 1</text><text className="t xs" x="10" y="49">3</text>
      <text className="t xs" x="20" y="14">2</text><text className="t xs r-t" x="36" y="14">4</text>
    </>
  ),
  hanoi: (
    <>
      <path className="k w2" d="M6 52h52M14 52V18M32 52V18M50 52V18" />
      <rect className="f" x="5" y="45" width="18" height="6" rx="1" />
      <rect className="r" x="7.5" y="38" width="13" height="6" rx="1" />
      <rect className="f" x="10" y="31" width="8" height="6" rx="1" />
      <rect className="k p" x="27" y="45" width="10" height="6" rx="1" />
    </>
  ),
  'lights-out': (
    <>
      {range(9).map(i => {
        const on = [0, 2, 4, 6, 8].includes(i);
        return <circle key={i} className={on ? (i === 4 ? 'r' : 'f') : 'k p'} cx={16 + (i % 3) * 16} cy={16 + Math.floor(i / 3) * 16} r="6" />;
      })}
      <path className="k w05" d="M32 7v3M32 22v3M23 16h3M38 16h3" />
    </>
  ),
  mastermind: (
    <>
      <rect className="k" x="6" y="14" width="52" height="36" rx="3" />
      {[0, 1].map(row => [0, 1, 2, 3].map(c => (
        <circle key={row + '-' + c} className={row === 0 && c === 1 ? 'r' : row === 0 ? 'f' : 'k p'} cx={14 + c * 9} cy={24 + row * 16} r="3.4" />
      )))}
      {[0, 1].map(row => [0, 1, 2, 3].map(c => (
        <circle key={'k' + row + c} className={row === 0 && c < 2 ? 'f' : 'k p w05'} cx={48 + (c % 2) * 4} cy={22 + row * 16 + Math.floor(c / 2) * 4} r="1.4" />
      )))}
    </>
  ),
  rubik: (
    <>
      <path className="k w15" d="M32 8L54 20.5V45.5L32 58L10 45.5V20.5Z" />
      <path className="k w15" d="M10 20.5L32 33L54 20.5M32 33V58" />
      <path className="k w05" d="M17.3 16.3L39.3 28.8M24.7 12.2L46.7 24.7M39.3 12.2L17.3 24.7M46.7 16.3L24.7 28.8" />
      <path className="k w05" d="M17.3 24.7V49.7M24.7 28.8V53.8M10 28.8L32 41.3M10 37.2L32 49.7" />
      <path className="k w05" d="M39.3 28.8V53.8M46.7 24.7V49.7M54 28.8L32 41.3M54 37.2L32 49.7" />
      <path className="r" d="M32 33L39.3 28.8V37.2L32 41.3Z" />
    </>
  ),
  huarong: (
    <>
      <rect className="k w2" x="12" y="6" width="40" height="50" />
      <rect className="r" x="23" y="7" width="18" height="18" />
      <rect className="k p" x="13" y="7" width="9" height="18" /><rect className="k p" x="42" y="7" width="9" height="18" />
      <rect className="k p" x="23" y="26" width="18" height="9" />
      <rect className="k p" x="13" y="26" width="9" height="18" /><rect className="k p" x="42" y="26" width="9" height="18" />
      <rect className="k sh" x="23" y="36" width="8" height="8" /><rect className="k sh" x="33" y="36" width="8" height="8" />
      <path className="k w2" d="M12 56h11M41 56h11" />
      <path className="k w05" d="M27 60h10" />
    </>
  ),
  tangram: (
    <>
      <path className="k w15" d="M10 10h44v44H10z" />
      <path className="k w15" d="M10 10L54 54M54 10L32 32M21 43L32 54M32 32L43 43M21 43L10 54" />
      <path className="r" d="M10 10L54 10L32 32Z" />
      <path className="f" d="M32 32L43 43L32 54L21 43Z" />
    </>
  ),
  sifeng: (
    <>
      {[[-10, 14, 20, 0], [0, 22, 14, 1], [10, 30, 20, 2]].map(([rot, x, y, c]) => <g key={c} transform={`rotate(${rot} ${x + 9} ${y + 13})`}><rect className="k w15 p" x={x} y={y} width="18" height="24" rx="2.5" /></g>)}
      <circle className="r" cx="31" cy="34" r="3.2" /><text className="t" x="23" y="16" style={{ fontSize: '9px' }}>风</text>
      <circle className="k w15" cx="47" cy="42" r="3" />
    </>
  ),
  kongming: (
    <>
      <path className="k w15 p" d="M6 30h18v6H6z" /><path className="k w15 p" d="M40 30h18v6H40z" /><path className="k w15 p" d="M29 6h6v18h-6z" />
      <path className="k w15 r-s" d="M14 22l6 6M50 22l-6 6M22 12l5 3" />
      <rect className="k w15" x="26" y="40" width="12" height="12" rx="1" /><path className="k w05" d="M26 46h12M32 40v12" />
    </>
  ),
  burr: (
    <>
      <path className="k w15 p" d="M10 28h44v8H10z" /><path className="k w15 p" d="M28 10h8v44h-8z" />
      <path className="k w15" d="M18 20l10 8M46 20l-10 8M18 44l10 -8M46 44l-10 -8" />
      <circle className="k f r" cx="32" cy="32" r="3" />
    </>
  ),
  'packing-3d': (
    <>
      <path className="k w15" d="M10 22l22 -10l22 10v22l-22 10l-22 -10z" /><path className="k w15" d="M10 22l22 10l22 -10M32 32v22" />
      <path className="k w15 p" d="M16 28l10 5v10l-10 -5z" /><path className="k f r" d="M38 33l10 -5v10l-10 5z" />
    </>
  ),
  'assembly-3d': (
    <>
      <path className="k w15 p" d="M8 44h48v6H8z" /><path className="k w15 p" d="M12 30h8v14h-8zM44 30h8v14h-8z" /><path className="k w15 p" d="M10 24h44v6H10z" />
      <path className="k f r" d="M28 14h8v10h-8z" />
    </>
  ),
  luban: (
    <>
      <path className="k w15 p" d="M8 28h48v8H8z" /><path className="k w15 p" d="M28 8h8v48h-8z" />
      <path className="k w15" d="M28 28l6 -4h8M36 28l6 -4M56 28l-4 -4h-10M36 8l6 -4M28 8l6 -4h8v48l-6 4" />
      <path className="k f r" d="M30 30h4v4h-4z" />
    </>
  ),
  soma: (
    <>
      <path className="k w15 p" d="M12 26l16 -8l16 8l-16 8z" /><path className="k w15 p" d="M12 26v16l16 8v-16z" /><path className="k w15 p" d="M28 34v16l16 -8v-16z" />
      <path className="k w05" d="M17 24l16 8M22 21l16 8M17 28v16M22 31v16M33 47l0 0M33 32v16M38 29v16" />
      <path className="k f r" d="M44 26l8 -4v16l-8 4z" opacity=".85" />
    </>
  ),
  'snake-cube': (
    <>
      {[[10, 44], [18, 44], [26, 44], [26, 36], [26, 28], [34, 28], [42, 28], [42, 20], [42, 12], [50, 12]].map(([x, y], i) => <rect key={i} className={i === 3 || i === 7 ? 'k w15 r' : 'k w15 p'} x={x - 4} y={y - 4} width="8" height="8" />)}
      <path className="k w05" d="M10 44h16v-16h16v-16h8" />
    </>
  ),
  hidato: (
    <>
      {[[14, 14, '1'], [32, 14, '2'], [50, 14, '3'], [50, 32, '4'], [32, 32, '5'], [14, 50, '6'], [32, 50, '7'], [50, 50, '8']].map(([x, y, v]) => <g key={String(v)}><circle className="k w15 p" cx={x as number} cy={y as number} r="7" /><text className={v === '1' || v === '8' ? 't r-t' : 't'} x={x as number} y={(y as number) + 3.5} textAnchor="middle" style={{ fontSize: '9px' }}>{v}</text></g>)}
      <path className="k w05" d="M21 14h4M39 14h4M50 21v4M43 32h-4M27 37l-7 7M21 50h4M39 50h4" />
    </>
  ),
  numberlink: (
    <>
      <rect className="k w2" x="8" y="8" width="48" height="48" />
      <path className="r-s w2" d="M16 16h32v16" /><path className="k w2" d="M16 48V32h16v16h16" />
      <circle className="k f r" cx="16" cy="16" r="4" /><circle className="k f r" cx="48" cy="32" r="4" />
      <circle className="k f" cx="16" cy="48" r="4" /><circle className="k f" cx="48" cy="48" r="4" />
    </>
  ),
  'n-queens': (
    <>
      <rect className="k w2 p" x="8" y="8" width="48" height="48" />
      {range(4).map(r => range(4).map(c => (r + c) % 2 ? <rect key={r + '-' + c} className="k f" x={8 + c * 12} y={8 + r * 12} width="12" height="12" opacity=".18" /> : null))}
      {[[1, 0], [3, 1], [0, 2], [2, 3]].map(([c, r]) => <text key={c} className={c === 1 ? 't r-t' : 't'} x={14 + c * 12} y={18 + r * 12} textAnchor="middle" style={{ fontSize: '10px' }}>♛</text>)}
    </>
  ),
  'river-crossing': (
    <>
      <path className="k w15" d="M4 22h16M44 22h16" /><path className="k w05" d="M22 30q5 -3 10 0t10 0M22 38q5 -3 10 0t10 0M22 46q5 -3 10 0t10 0" />
      <path className="k w2 p" d="M24 26h16l-3 6h-10z" /><path className="k w15" d="M32 26V14l6 6h-6" />
      <circle className="k f" cx="10" cy="17" r="3" /><circle className="k f r" cx="52" cy="17" r="3" />
    </>
  ),
  futoshiki: (
    <>
      <rect className="k w2 p" x="8" y="8" width="20" height="20" rx="2" /><rect className="k w2 p" x="36" y="8" width="20" height="20" rx="2" />
      <rect className="k w2 p" x="8" y="36" width="20" height="20" rx="2" /><rect className="k w2 p" x="36" y="36" width="20" height="20" rx="2" />
      <text className="t r-t" x="32" y="22" textAnchor="middle">&lt;</text><text className="t r-t" x="18" y="35" textAnchor="middle" style={{ fontSize: '9px' }}>∨</text>
      <text className="t" x="18" y="23" textAnchor="middle">3</text><text className="t" x="46" y="51" textAnchor="middle">1</text>
    </>
  ),
  binary: (
    <>
      <rect className="k w2 p" x="8" y="8" width="48" height="48" />
      <path className="k w05" d="M20 8v48M32 8v48M44 8v48M8 20h48M8 32h48M8 44h48" />
      <text className="t" x="14" y="18" textAnchor="middle">0</text><text className="t r-t" x="26" y="18" textAnchor="middle">1</text><text className="t r-t" x="38" y="30" textAnchor="middle">1</text>
      <text className="t" x="50" y="30" textAnchor="middle">0</text><text className="t" x="26" y="42" textAnchor="middle">0</text><text className="t r-t" x="14" y="54" textAnchor="middle">1</text>
    </>
  ),
  kakuro: (
    <>
      <rect className="k w2" x="8" y="8" width="48" height="48" />
      <rect className="k f" x="8" y="8" width="16" height="16" /><rect className="k f" x="8" y="24" width="16" height="16" /><rect className="k f" x="24" y="8" width="16" height="16" />
      <path className="k w05" d="M24 24L40 40M8 40h48M40 8v48M24 40v16M40 24h16" />
      <text className="t" x="14" y="37" style={{ fontSize: '7px' }}>4</text><text className="t" x="32" y="21" style={{ fontSize: '7px' }}>3</text>
      <text className="t" x="32" y="52" textAnchor="middle">1</text><text className="t" x="48" y="36" textAnchor="middle">2</text>
    </>
  ),
  slitherlink: (
    <>
      {[12, 24, 36, 48].map(y => [12, 24, 36, 48].map(x => <circle key={x + '-' + y} className="k f" cx={x} cy={y} r="1.6" />))}
      <path className="r-s w2" d="M12 12h24v12h12v24h-24v-12h-12z" />
      <text className="t" x="18" y="21" textAnchor="middle">3</text><text className="t" x="42" y="45" textAnchor="middle">2</text><text className="t" x="30" y="33" textAnchor="middle">0</text>
    </>
  ),
  'nine-rings': (
    <>
      <path className="k w2" d="M10 22h44a4 4 0 0 1 0 8H10" /><rect className="k f r" x="4" y="18" width="10" height="16" rx="3" />
      {[0, 1, 2, 3, 4].map(i => <ellipse key={i} className="k w15" cx={22 + i * 8} cy={26} rx="3" ry="7" />)}
      {[0, 1, 2, 3, 4].map(i => <path key={'p' + i} className="k w05" d={`M${22 + i * 8} 33V52`} />)}
      <path className="k w2" d="M8 52h48" />
    </>
  ),
  kenken: (
    <>
      <rect className="k w2 p" x="8" y="8" width="48" height="48" />
      <path className="k w05" d="M24 8v48M40 8v48M8 24h48M8 40h48" />
      <path className="k w2" d="M24 8v32M8 40h32M40 24h16" />
      <text className="t r-t" x="10" y="19" style={{ fontSize: '8px' }}>12×</text>
      <text className="t" x="28" y="36">3</text><text className="t" x="44" y="52">1</text>
    </>
  ),
  hashi: (
    <>
      <path className="k w15" d="M16 16H48M16 16V48M14 48H50M18 48h0" /><path className="k w15" d="M48 18V46M51 18V46" />
      {[[16, 16, '3'], [48, 16, '3'], [16, 48, '2'], [48, 48, '4']].map(([x, y, n]) => <g key={String(x) + y}><circle className="k w15 p" cx={x as number} cy={y as number} r="7" /><text className="t" x={(x as number) - 3.4} y={(y as number) + 4}>{n}</text></g>)}
    </>
  ),
  sokoban: (
    <>
      <rect className="k w15 p" x="8" y="8" width="48" height="48" />
      <rect className="k w15 r" x="28" y="24" width="16" height="16" rx="2" /><path className="k w1" d="M28 24l16 16M44 24L28 40" />
      <circle className="k w15 p" cx="18" cy="32" r="6" /><circle className="f" cx="48" cy="48" r="3" />
    </>
  ),
  g2048: (
    <>
      {[0, 1, 2, 3].map(k => <rect key={k} className={'k w15 ' + (k === 3 ? 'r' : 'p')} x={10 + (k % 2) * 23} y={10 + Math.floor(k / 2) * 23} width="21" height="21" rx="3" />)}
      <text className="t" x="15" y="25" style={{ fontSize: '9px' }}>2</text><text className="t" x="38" y="25" style={{ fontSize: '9px' }}>4</text>
      <text className="t" x="15" y="48" style={{ fontSize: '9px' }}>8</text><text className="t" x="34" y="48" style={{ fontSize: '8px' }}>2048</text>
    </>
  ),
  chess: (
    <>
      <path className="k w15 p" d="M22 54h20l-2-6H24zM25 48l2-14h10l2 14M27 34c-4-2-5-8-1-12 2-2 5-3 6-6 1 3 4 4 6 6 4 4 3 10-1 12z" />
      <path className="r" d="M30 12h4v3h3v3h-3v4h-4v-4h-3v-3h3z" />
      <path className="k w15" d="M16 58h32" />
    </>
  ),
  xiangqi: (
    <>
      <circle className="k w2 p" cx="32" cy="32" r="20" /><circle className="k w05" cx="32" cy="32" r="16" />
      <text className="t r-t" x="22" y="40" style={{ fontSize: '20px' }}>帥</text>
    </>
  ),
  shogi: (
    <>
      <path className="k w2 p" d="M32 10l13 6 3 38H16l3-38z" />
      <text className="t" x="23" y="42" style={{ fontSize: '19px' }}>王</text>
      <path className="r" d="M24 50h16" />
    </>
  ),
  weiqi: (
    <>
      <rect className="k w15 p" x="8" y="8" width="48" height="48" />
      {[20, 32, 44].map(v => <path key={v} className="k w05" d={`M${v} 8v48M8 ${v}h48`} />)}
      <circle className="f" cx="20" cy="20" r="5.5" /><circle className="f" cx="32" cy="32" r="5.5" /><circle className="k w15 p" cx="44" cy="32" r="5.5" />
      <circle className="k w15 p" cx="32" cy="44" r="5.5" /><circle className="r" cx="32" cy="20" r="5.5" />
    </>
  ),
  pisti: (
    <>
      <rect className="k p w15" x="10" y="16" width="22" height="32" rx="2.5" transform="rotate(-10 21 32)" />
      <rect className="k p w15" x="30" y="14" width="22" height="32" rx="2.5" transform="rotate(8 41 30)" />
      <text className="t" x="15" y="30" transform="rotate(-10 21 32)">J</text>
      <text className="t r-t" x="35" y="28" transform="rotate(8 41 30)">J</text>
      <path className="r" d="M41 34l3 4-3 4-3-4z" transform="rotate(8 41 30)" />
      <path className="k w15" d="M12 54h40" />
    </>
  ),
  batak: (
    <>
      {[-24, -8, 8, 24].map((a, i) => <rect key={i} className="k p w15" x="22" y="12" width="20" height="30" rx="2.5" transform={`rotate(${a} 32 52)`} />)}
      <path className="f" d="M32 20c-4 5-8 7-8 11 0 3 3 4 6 2l-1 4h6l-1-4c3 2 6 1 6-2 0-4-4-6-8-11z" />
    </>
  ),
  king: (
    <>
      <rect className="k p w15" x="18" y="18" width="28" height="38" rx="3" />
      <path className="r" d="M22 16l4-8 6 6 6-6 4 8z" />
      <text className="t" x="23" y="34">K</text>
      <path className="r" d="M32 50c-6-4-8-7-8-9.5 0-2 1.5-3.5 3.5-3.5 2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3 2 0 3.5 1.5 3.5 3.5 0 2.5-2 5.5-8 9.5z" />
    </>
  ),
  poker: (
    <>
      <rect className="k p w15" x="10" y="12" width="20" height="28" rx="2.5" transform="rotate(-8 20 26)" />
      <rect className="k p w15" x="24" y="10" width="20" height="28" rx="2.5" transform="rotate(8 34 24)" />
      <text className="t" x="14" y="25" transform="rotate(-8 20 26)">A</text>
      <text className="t r-t" x="28" y="23" transform="rotate(8 34 24)">A</text>
      {[0, 1, 2].map(i => <ellipse key={i} className={'k w15 ' + (i === 1 ? 'r' : 'p')} cx="46" cy={52 - i * 5} rx="9" ry="3.2" />)}
      <ellipse className="k w15 p" cx="26" cy="52" rx="9" ry="3.2" />
    </>
  ),
  tavla: (
    <>
      <rect className="k w15" x="5" y="12" width="54" height="40" rx="1.5" />
      <path className="k w15" d="M32 12v40" />
      {range(6).map(i => <path key={'a' + i} className={i % 2 ? 'k p' : 'sh2'} d={`M${7 + i * 4} 13l2 14 2-14z`} />)}
      {range(6).map(i => <path key={'b' + i} className={i % 2 ? 'sh2' : 'k p'} d={`M${7 + i * 4} 51l2-14 2 14z`} />)}
      <rect className="k p" x="38" y="26" width="9" height="9" rx="1.5" transform="rotate(-12 42.5 30.5)" />
      <rect className="k p" x="49" y="29" width="9" height="9" rx="1.5" transform="rotate(10 53.5 33.5)" />
      <circle className="f" cx="40.5" cy="28.5" r="1" /><circle className="f" cx="44.5" cy="32.5" r="1" />
      <circle className="r" cx="53.5" cy="33.5" r="1.2" />
    </>
  ),
  okey: (
    <>
      <path className="k w2" d="M4 50h56" /><path className="sh2" d="M6 50l4 6h44l4-6z" />
      {[0, 1, 2].map(i => (
        <g key={i}><rect className="k p" x={9 + i * 16} y="18" width="14" height="30" rx="2" />
          <text className={'t b' + (i === 1 ? ' r-t' : '')} x={16 + i * 16} y="37" textAnchor="middle">{[7, 8, 9][i]}</text></g>
      ))}
    </>
  ),
  mahjong: (
    <>
      <path className="k w2" d="M4 52h56" />
      {[0, 1, 2].map(i => <rect key={i} className="k p" x={6 + i * 18} y={14 + (i === 1 ? -4 : 0)} width="16" height="32" rx="2.5" />)}
      <text className="t b r-t" x="14" y="36" textAnchor="middle">中</text>
      <circle className="k w15" cx="32" cy="18" r="3.4" /><circle className="k w15" cx="32" cy="26" r="3.4" /><circle className="k w15" cx="32" cy="34" r="3.4" />
      <path className="k w2" d="M46 22v18M50 22v18M54 22v18" />
    </>
  ),
  'okey-101': (
    <>
      <rect className="k p" x="6" y="10" width="16" height="22" rx="2" /><rect className="k p" x="24" y="10" width="16" height="22" rx="2" /><rect className="k p" x="42" y="10" width="16" height="22" rx="2" />
      <text className="t b" x="14" y="26" textAnchor="middle">1</text><text className="t b r-t" x="32" y="26" textAnchor="middle">0</text><text className="t b" x="50" y="26" textAnchor="middle">1</text>
      <path className="k w15" d="M8 42h48" />
      {range(5).map(i => <rect key={i} className={'k ' + (i === 2 ? 'sh' : 'p')} x={8 + i * 10} y="46" width="8" height="11" rx="1.2" />)}
    </>
  ),
  dama: (
    <>
      <rect className="k w2" x="8" y="8" width="48" height="48" />
      {[20, 32, 44].map(v => <path key={v} className="k w05" d={`M${v} 8v48M8 ${v}h48`} />)}
      {[[14, 14], [26, 14], [38, 14], [50, 14]].map(([x, y]) => <circle key={x} className="f" cx={x} cy={y} r="4.4" />)}
      {[[14, 50], [26, 50], [50, 50]].map(([x, y]) => <circle key={x} className="k p" cx={x} cy={y} r="4.4" />)}
      <circle className="k p" cx="38" cy="38" r="4.4" /><circle className="r" cx="38" cy="38" r="2" />
    </>
  ),
  gomoku: (
    <>
      {range(7).map(i => <path key={i} className="k w05" d={`M${8 + i * 8} 8v48M8 ${8 + i * 8}h48`} />)}
      {range(5).map(i => <circle key={i} className={i === 4 ? 'r' : 'f'} cx={16 + i * 8} cy={48 - i * 8} r="3.4" />)}
      {[[24, 24], [40, 48], [48, 24], [16, 32]].map(([x, y]) => <circle key={x + '-' + y} className="k p" cx={x} cy={y} r="3.4" />)}
    </>
  ),
  reversi: (
    <>
      <rect className="k w15" x="8" y="8" width="48" height="48" />
      {[20, 32, 44].map(v => <path key={v} className="k w05" d={`M${v} 8v48M8 ${v}h48`} />)}
      <circle className="k p" cx="26" cy="26" r="4.6" /><circle className="f" cx="38" cy="26" r="4.6" />
      <circle className="f" cx="26" cy="38" r="4.6" /><circle className="k p" cx="38" cy="38" r="4.6" />
      <circle className="r" cx="14" cy="14" r="2" />
    </>
  ),
  'connect-four': (
    <>
      <rect className="k w15" x="6" y="12" width="52" height="40" rx="2" />
      <path className="k w15" d="M10 52v6M54 52v6" />
      {range(20).map(i => {
        const c = i % 5, r = Math.floor(i / 5), cls = (r === 3 && c < 4) ? 'f' : (r === 2 && c === 1) || (r === 3 && c === 4) ? 'r' : 'k p w05';
        return <circle key={i} className={cls} cx={14 + c * 9} cy={19 + r * 9} r="3.4" />;
      })}
    </>
  ),
  billiards: (
    <>
      {[[32, 22], [28, 29], [36, 29], [24, 36], [32, 36], [40, 36]].map(([x, y], i) => (
        <circle key={i} className={i === 4 ? 'f' : i === 0 ? 'r' : 'k p'} cx={x} cy={y} r="3.8" />
      ))}
      <path className="k w05" d="M19 40L32 16.5L45 40Z" />
      <circle className="k p" cx="32" cy="50" r="3.8" />
      <path className="k w2" d="M32 55L32 62" /><path className="k w05" d="M32 46L32 41" strokeDasharray="1 1.5" />
    </>
  ),
  tictactoe: (
    <>
      <path className="k w2" d="M25 8v48M39 8v48M8 25h48M8 39h48" />
      <path className="k w2" d="M12 12l9 9M21 12l-9 9M43 43l9 9M52 43l-9 9" />
      <circle className="k w2" cx="32" cy="32" r="4.5" /><circle className="k w2" cx="48" cy="16" r="4.5" />
      <path className="r-s w2" d="M12 52L52 12" />
    </>
  ),
  'dots-boxes': (
    <>
      <rect className="r" x="12" y="12" width="20" height="20" opacity=".85" />
      <path className="k w2" d="M12 12h20v20H12zM32 12h20M52 12v20M12 32v20M32 52h20" />
      {range(9).map(i => <circle key={i} className="f" cx={12 + (i % 3) * 20} cy={12 + Math.floor(i / 3) * 20} r="2.4" />)}
    </>
  ),
  mancala: (
    <>
      <rect className="k w15" x="3" y="18" width="58" height="28" rx="14" />
      <rect className="k" x="6" y="22" width="8" height="20" rx="4" /><rect className="k" x="50" y="22" width="8" height="20" rx="4" />
      {[0, 1, 2, 3].map(i => <circle key={'t' + i} className="k" cx={20 + i * 8} cy="26" r="3.2" />)}
      {[0, 1, 2, 3].map(i => <circle key={'b' + i} className="k" cx={20 + i * 8} cy="38" r="3.2" />)}
      <circle className="f" cx="19" cy="25" r="1" /><circle className="f" cx="21" cy="27" r="1" /><circle className="r" cx="36" cy="38" r="1.2" />
      <circle className="f" cx="9" cy="30" r="1" /><circle className="f" cx="11" cy="34" r="1" /><circle className="r" cx="54" cy="32" r="1.2" /><circle className="f" cx="53" cy="36" r="1" />
    </>
  ),
  morris: (
    <>
      <rect className="k w15" x="8" y="8" width="48" height="48" /><rect className="k w15" x="16" y="16" width="32" height="32" /><rect className="k w15" x="24" y="24" width="16" height="16" />
      <path className="k w15" d="M32 8v16M32 40v16M8 32h16M40 32h16" />
      <circle className="f" cx="8" cy="8" r="3.4" /><circle className="f" cx="32" cy="8" r="3.4" /><circle className="f" cx="56" cy="8" r="3.4" />
      <path className="r-s w15" d="M8 8h48" />
      <circle className="k p" cx="16" cy="48" r="3.4" /><circle className="k p" cx="48" cy="32" r="3.4" /><circle className="k p" cx="40" cy="40" r="3.4" />
    </>
  ),
  'bulls-cows': (
    <>
      {[0, 1, 2, 3].map(i => <rect key={i} className="k p" x={6 + i * 11} y="14" width="9" height="13" rx="1.5" />)}
      <text className="t b" x="10.5" y="25" textAnchor="middle">4</text><text className="t b" x="21.5" y="25" textAnchor="middle">7</text>
      <text className="t b" x="32.5" y="25" textAnchor="middle">1</text><text className="t b" x="43.5" y="25" textAnchor="middle">9</text>
      <text className="t b r-t" x="54" y="25" textAnchor="middle">?</text>
      <path className="k w05" d="M6 34h52M6 44h52" />
      <text className="t s" x="8" y="41">1 2 3 4</text><text className="t s r-t" x="42" y="41">+1</text><text className="t s" x="51" y="41">−2</text>
      <text className="t s" x="8" y="51">5 6 7 8</text><text className="t s" x="42" y="51">+0</text><text className="t s" x="51" y="51">−1</text>
    </>
  ),
  battleship: (
    <>
      {[0, 1, 2, 3, 4, 5].map(i => <path key={i} className="k w05" d={`M${10 + i * 9} 10v45M10 ${10 + i * 9}h45`} />)}
      <path className="f" d="M12 31h33l-4 6H16z" /><rect className="f" x="24" y="26" width="10" height="5" /><path className="k w15" d="M29 26v-5" />
      <path className="k" d="M6 44q4-3 8 0t8 0 8 0 8 0 8 0 8 0 8 0" />
      <path className="r-s w2" d="M47 14l6 6M53 14l-6 6" /><circle className="k" cx="18" cy="17" r="1.6" />
    </>
  ),
  qubic: (
    <>
      {[0, 1, 2, 3].map(l => <path key={l} className="k w05" d={`M${10} ${46 - l * 11}l22-8 22 8-22 8z`} />)}
      <path className="k w05" d="M10 46v-33M54 46v-33M32 54v-33M32 38v-33" />
      {[[16, 44, 'f'], [27, 40, 'r'], [32, 30, 'f'], [37, 20, 'r'], [43, 10, 'f'], [21, 31, 'r'], [43, 32, 'k p']].map(([x, y, c], i) => <circle key={i} className={String(c)} cx={Number(x)} cy={Number(y)} r="3" />)}
      <path className="r-s w15" d="M16 44L43 10" strokeDasharray="2 2" />
    </>
  ),
  'football-70': (
    <>
      <rect className="k w15" x="6" y="10" width="52" height="44" />
      <path className="k w05" d="M32 10v44M6 24h10v16H6M58 24H48v16h10" /><circle className="k w05" cx="32" cy="32" r="6" />
      <circle className="k p w15" cx="44" cy="20" r="5" /><path className="f" d="M44 17l2.4 1.7-.9 2.8h-3l-.9-2.8z" />
      <text className="t b r-t" x="20" y="38" textAnchor="middle">7</text><text className="t b" x="27" y="38">-0</text>
    </>
  ),
  checkers: (
    <>
      <rect className="k w2" x="7" y="7" width="50" height="50" />
      {range(5).map(r => range(5).map(c => (r + c) % 2 ? null : <rect key={r * 5 + c} className="sh" x={7 + c * 10} y={7 + r * 10} width="10" height="10" />))}
      {[[12, 12], [32, 12], [52, 12], [22, 22]].map(([x, y]) => <circle key={x + '-' + y} className="f" cx={x} cy={y} r="3.8" />)}
      {[[12, 52], [32, 52], [42, 42]].map(([x, y]) => <circle key={x + '-' + y} className="k p" cx={x} cy={y} r="3.8" />)}
      <circle className="k p" cx="52" cy="32" r="3.8" /><circle className="r" cx="52" cy="32" r="1.8" />
      <path className="r-s w15" d="M42 42L22 22" strokeDasharray="2 2" />
    </>
  ),
  'chinese-checkers': (
    <>
      <path className="k w15" d="M32 5L44 26H56L44 47L32 59L20 47L8 26H20Z" />
      <path className="k w05" d="M32 5L56 47H8Z M8 26H56L32 59Z" />
      {[[32, 12], [29, 17], [35, 17]].map(([x, y], i) => <circle key={i} className="f" cx={x} cy={y} r="2.6" />)}
      {[[32, 52], [29, 47], [35, 47]].map(([x, y], i) => <circle key={i} className="r" cx={x} cy={y} r="2.6" />)}
      {[[26, 32], [32, 32], [38, 32], [29, 27]].map(([x, y], i) => <circle key={i} className="k p" cx={x} cy={y} r="2" />)}
    </>
  ),
  dominoes: (
    <>
      <rect className="k p w15" x="8" y="20" width="26" height="14" rx="2" transform="rotate(-12 21 27)" />
      <path className="k w05" d="M21 20v14" transform="rotate(-12 21 27)" />
      <rect className="k p w15" x="30" y="30" width="26" height="14" rx="2" transform="rotate(8 43 37)" />
      <path className="k w05" d="M43 30v14" transform="rotate(8 43 37)" />
      {[[13, 27], [16, 25], [26, 25], [29, 27]].map(([x, y], i) => <circle key={i} className="f" cx={x} cy={y} r="1.5" />)}
      {[[35, 34], [38, 37], [35, 40], [48, 36], [51, 38]].map(([x, y], i) => <circle key={i} className={i > 2 ? 'r' : 'f'} cx={x} cy={y} r="1.5" />)}
    </>
  ),
  'ultimate-ttt': (
    <>
      <path className="k w2" d="M25 6v52M39 6v52M6 25h52M6 39h52" />
      <path className="k w05" d="M11 9v12M16 9v12M8 13h12M8 17h12M47 43v12M52 43v12M44 47h12M44 51h12" />
      <path className="r-s w15" d="M27 27l10 10M37 27l-10 10" />
      <circle className="k w15" cx="50" cy="15" r="6" /><circle className="k w15" cx="14" cy="49" r="6" />
    </>
  ),
  nim: (
    <>
      {[1, 3, 5, 7].map((n, r) => range(n).map(i => <g key={r + '-' + i}><path className={'k w2' + (r === 3 && i > 4 ? ' sh' : '')} d={`M${32 - (n - 1) * 3.5 + i * 7} ${12 + r * 12}v9`} /><circle className="r" cx={32 - (n - 1) * 3.5 + i * 7} cy={11 + r * 12} r="1.6" /></g>))}
    </>
  ),
  crossword: (
    <>
      {range(5).map(r => range(5).map(c => {
        const black = [[0, 3], [1, 1], [2, 4], [3, 0], [3, 2], [4, 3]].some(([a, b]) => a === r && b === c);
        return <rect key={r * 5 + c} className={black ? 'f' : 'k p w05'} x={7 + c * 10} y={7 + r * 10} width="10" height="10" />;
      }))}
      <text className="t s" x="8.5" y="12">1</text><text className="t s" x="28.5" y="12">2</text>
      <text className="t b r-t" x="12" y="25" textAnchor="middle">A</text><text className="t b" x="32" y="25" textAnchor="middle">Y</text>
    </>
  ),
  'word-search': (
    <>
      {['KELIM', 'ADENZ', 'ROYUN', 'TAVLA', 'SIMIT'].map((row, r) => [...row].map((ch, c) => <text key={r * 5 + c} className="t s" x={12 + c * 10} y={15 + r * 10} textAnchor="middle">{ch}</text>))}
      <rect className="r-s w15" x="6" y="37" width="52" height="11" rx="5.5" fill="none" />
      <path className="r-s w15" d="M8 9l46 40" strokeDasharray="2 2" />
    </>
  ),
  wordle: (
    <>
      {range(3).map(r => range(5).map(c => {
        const m = [['x', 'y', 'x', 'g', 'x'], ['g', 'x', 'y', 'g', 'x'], ['g', 'g', 'g', 'g', 'g']][r][c];
        return <rect key={r * 5 + c} className={m === 'g' ? 'f' : m === 'y' ? 'r' : 'k p w05'} x={6 + c * 10.6} y={14 + r * 12} width="9" height="10" rx="1.5" />;
      }))}
    </>
  ),
  anagram: (
    <>
      {['M', 'R', 'A', 'G', 'A', 'N'].map((ch, i) => <g key={i}><rect className="k p" x={4 + i * 9.6} y={i % 2 ? 12 : 8} width="8.5" height="11" rx="1.5" /><text className="t s" x={8.25 + i * 9.6} y={(i % 2 ? 12 : 8) + 8.5} textAnchor="middle">{ch}</text></g>)}
      <path className="k w15" d="M20 32c4 6 20 6 24 0" /><path className="k w15" d="M40 30l4 2-1 4" />
      {['A', 'N', 'A', 'G', 'R', 'A', 'M'].slice(0, 6).map((ch, i) => <g key={'b' + i}><rect className={'k ' + (i < 3 ? 'sh' : 'p')} x={4 + i * 9.6} y="42" width="8.5" height="11" rx="1.5" /><text className="t s" x={8.25 + i * 9.6} y="50.5" textAnchor="middle">{ch}</text></g>)}
    </>
  ),
  'minesweeper-3d': (
    <>
      <path className="k w15" d="M32 8L54 20.5V45.5L32 58L10 45.5V20.5Z" /><path className="k w15" d="M10 20.5L32 33L54 20.5M32 33V58" />
      <path className="k w05" d="M17.3 16.3L39.3 28.8M24.7 12.2L46.7 24.7M39.3 12.2L17.3 24.7M46.7 16.3L24.7 28.8M17.3 24.7V49.7M24.7 28.8V53.8M10 28.8L32 41.3M10 37.2L32 49.7M39.3 28.8V53.8M46.7 24.7V49.7M54 28.8L32 41.3M54 37.2L32 49.7" />
      <circle className="f" cx="20.5" cy="37" r="2.6" /><path className="k w05" d="M17 37h7M20.5 33.5v7" />
      <path className="r" d="M41 33.5v8l5-2.5z" /><text className="t s" x="30" y="22">2</text><text className="t s r-t" x="40" y="47">3</text>
    </>
  ),
};

export function GameArt({ id, className }: { id: string; className?: string }) {
  const body = ART[id];
  if (!body) return null;
  return <svg className={'art' + (className ? ' ' + className : '')} viewBox="0 0 64 64" aria-hidden="true">{body}</svg>;
}
