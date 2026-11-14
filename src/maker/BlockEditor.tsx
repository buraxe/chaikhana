import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import * as Tr from 'blockly/msg/tr';
import * as Zh from 'blockly/msg/zh-hans';
import { useEffect, useRef, useState } from 'react';
import { useLang, useT } from '../core/i18n';
import { blockDefinitions, rulesToWorkspace, toolbox, workspaceToRules, type WorkspaceState } from './blocks';
import { canon, validate, type GameDef, type Rule } from './engine';

/** Reads the page's colour tokens so the block area matches the light or dark theme. */
function theme(): Blockly.Theme {
  const css = getComputedStyle(document.documentElement), v = (k: string, f: string) => css.getPropertyValue(k).trim() || f;
  return Blockly.Theme.defineTheme('chaikhana-' + Math.random().toString(36).slice(2), {
    name: 'chaikhana',
    base: Blockly.Themes.Classic,
    componentStyles: {
      workspaceBackgroundColour: v('--surface', '#fbf6ea'),
      toolboxBackgroundColour: v('--sunk', '#e9dfc6'),
      toolboxForegroundColour: v('--ink', '#261b12'),
      flyoutBackgroundColour: v('--bg', '#f3ead6'),
      flyoutForegroundColour: v('--ink', '#261b12'),
      flyoutOpacity: 0.97,
      scrollbarColour: v('--line', '#d4c4a3'),
      insertionMarkerColour: v('--ink', '#261b12'),
      insertionMarkerOpacity: 0.3,
    },
    fontStyle: { family: '"Instrument Sans", system-ui, sans-serif', size: 11 },
  } as Parameters<typeof Blockly.Theme.defineTheme>[1]);
}

export default function BlockEditor({ def, onApply }: { def: GameDef; onApply: (rules: Rule[]) => void }) {
  const lang = useLang(), t = useT();
  const host = useRef<HTMLDivElement>(null), ws = useRef<Blockly.WorkspaceSvg | null>(null);
  const [rules, setRules] = useState<Rule[]>(def.rules);
  const [errs, setErrs] = useState<string[]>([]);
  const [loose, setLoose] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    if (!host.current) return;
    Blockly.setLocale((lang === 'zh' ? Zh : lang === 'tr' ? Tr : En) as unknown as { [key: string]: string });
    // Blocks are defined afresh for each game, so the dropdowns list its own pieces, zones and counters.
    const defs = blockDefinitions(def, lang);
    for (const d of defs) delete Blockly.Blocks[String(d.type)];
    Blockly.common.defineBlocksWithJsonArray(defs);
    const narrow = host.current.clientWidth < 640;
    const w = Blockly.inject(host.current, {
      toolbox: toolbox(def, lang) as Blockly.utils.toolbox.ToolboxDefinition,
      renderer: 'zelos', theme: theme(), trashcan: false, sounds: false,
      // Blockly's own buttons load pictures from its website, which the page may not reach; ours are plain buttons.
      zoom: { controls: false, wheel: false, pinch: true, startScale: narrow ? 0.6 : 0.78, maxScale: 1.6, minScale: 0.3 },
      move: { scrollbars: true, drag: true, wheel: true },
    });
    ws.current = w;
    Blockly.serialization.workspaces.load(rulesToWorkspace(def.rules, lang) as object, w);
    w.cleanUp();
    // Start at the top of the first rule.
    const first = w.getTopBlocks(true)[0];
    if (first) { const xy = first.getRelativeToSurfaceXY(), sc = w.scale; w.scroll(-xy.x * sc + 12, -xy.y * sc + 12); }
    setRules(def.rules); setErrs([]); setLoose(0); setDirty(false);
    let timer = 0;
    const read = () => {
      const state = Blockly.serialization.workspaces.save(w) as WorkspaceState;
      const out = workspaceToRules(state, lang);
      setRules(out.rules); setLoose(out.loose); setErrs(validate({ ...def, rules: out.rules }));
      // Moving blocks around is not a change; only a different set of rules is.
      setDirty(canon(out.rules) !== canon(def.rules));
    };
    w.addChangeListener(e => {
      if (e.isUiEvent || w.isDragging()) return;
      clearTimeout(timer);
      timer = window.setTimeout(read, 250);
    });
    return () => { clearTimeout(timer); w.dispose(); ws.current = null; };
  }, [def, lang, generation]);

  return (
    <div className="wk-blocks">
      <p className="muted small">{t('Drag blocks from the left. Each rule starts with an orange “When …” block; rules run from top to bottom. The dropdowns list this game’s own pieces, zones and counters; its materials are still edited in JSON for now.',
        '从左侧拖出积木。每条规则以橙色的“当……时”积木开头；规则自上而下依次执行。下拉菜单列出本游戏自己的棋子、区域和计数器；材料目前仍在JSON中编辑。',
        'Blokları soldan sürükle. Her kural turuncu bir “… olunca” bloğuyla başlar; kurallar yukarıdan aşağı sırayla çalışır. Açılır listelerde bu oyunun kendi taşları, alanları ve sayaçları var; malzemeler şimdilik JSON’da düzenleniyor.')}</p>
      <div className="wk-blockly-wrap">
        <div ref={host} className="wk-blockly" id="wk-blockly" />
        <div className="wk-zoom" role="group" aria-label={t('Zoom', '缩放', 'Yakınlaştır')}>
          <button type="button" id="wk-zoom-in" aria-label="+" onClick={() => ws.current?.zoomCenter(1)}>+</button>
          <button type="button" id="wk-zoom-out" aria-label="−" onClick={() => ws.current?.zoomCenter(-1)}>−</button>
          <button type="button" id="wk-zoom-fit" aria-label={t('Fit', '适应', 'Sığdır')} onClick={() => ws.current?.zoomToFit()}>⤢</button>
        </div>
      </div>
      <div className="tools">
        <button type="button" className="btn primary" id="wk-apply" disabled={!dirty || errs.length > 0} onClick={() => onApply(rules)}>{t('Save and play', '保存并试玩', 'Kaydet ve oyna')}</button>
        <button type="button" className="btn" id="wk-revert" disabled={!dirty} onClick={() => setGeneration(g => g + 1)}>{t('Undo all changes', '撤销全部修改', 'Tüm değişiklikleri geri al')}</button>
        <span className="muted small">{t(`${rules.length} rules`, `${rules.length} 条规则`, `${rules.length} kural`)}{loose > 0 ? t(` · ${loose} loose blocks are ignored`, ` · ${loose} 个散落的积木会被忽略`, ` · ${loose} boşta blok yok sayılır`) : ''}</span>
      </div>
      {errs.length > 0 && <ul className="wk-errs" role="alert">{errs.slice(0, 8).map((e, i) => <li key={i}>{e}</li>)}</ul>}
    </div>
  );
}
