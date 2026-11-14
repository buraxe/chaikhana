import type { ReactNode } from 'react';
import type { Profile } from '../core/store';

export const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  const p = (n: number) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m % 60)}:${p(s % 60)}` : `${m}:${p(s % 60)}`;
};

/** Best-time keys are readable labels ("9×9 Medium"); older saves used "9-medium". */
export const fmtBestKey = (k: string) => k.replace(/^(\d+)-(\w+)$/, (_, n, d: string) => `${n}×${n} ${d[0].toUpperCase()}${d.slice(1)}`);

export function Avatar({ p, size = 32 }: { p: Pick<Profile, 'glyph' | 'color'>; size?: number }) {
  return <span className="avatar" style={{ background: p.color, width: size, height: size, fontSize: size * 0.5 }} aria-hidden="true">{p.glyph}</span>;
}

export function Seg<T extends string | number>({ label, value, options, onChange, id }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; id: string;
}) {
  return (
    <div className="field">
      <span className="field-label" id={id + '-l'}>{label}</span>
      <div className="seg" role="group" aria-labelledby={id + '-l'}>
        {options.map(o => (
          <button key={String(o.value)} id={`${id}-${o.value}`} type="button" className={o.value === value ? 'on' : ''}
            aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

export function Pick<T extends string | number>({ label, value, options, onChange, id }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; id: string;
}) {
  const numeric = typeof value === 'number';
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}</span>
      <select id={id} value={String(value)} onChange={e => onChange((numeric ? Number(e.target.value) : e.target.value) as T)}>
        {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
      </select>
    </label>
  );
}

export const Section = ({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) => (
  <section className="section">
    <header className="section-head"><h2>{title}</h2>{aside}</header>
    {children}
  </section>
);
