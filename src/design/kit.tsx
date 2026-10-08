import { useState, type ReactNode, type Ref } from 'react'
import { Check, X } from 'lucide-react'
import { cx } from './shared'

/** 选择类控件的统一外观：选中 = 服务强调色底 + 强调色字 + 对勾；未选中 = 描边 */
export function Chip({ on, onClick, children, size = 'md', disabled, role, dashed, className }: {
  on?: boolean; onClick?: () => void; children: ReactNode; size?: 'sm' | 'md'; disabled?: boolean; role?: 'radio'; dashed?: boolean; className?: string
}) {
  const aria = role === 'radio' ? { role, 'aria-checked': !!on } : { 'aria-pressed': !!on }
  return (
    <button type="button" onClick={onClick} disabled={disabled} {...aria}
      className={cx('flex shrink-0 items-center gap-1.5 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-40', size === 'sm' ? 'h-8 px-3 text-caption' : 'h-10 px-4 text-body',
        on ? 'border-accent bg-accent-soft font-semibold text-accent-ink' : dashed ? 'border-dashed border-mark text-ink-2 hover:border-accent hover:text-accent-ink' : 'border-line text-ink-2 hover:border-ink-3 hover:text-ink', className)}>
      {on && <Check className={size === 'sm' ? 'size-3' : 'size-3.5'} strokeWidth={3} />}{children}
    </button>
  )
}

/**
 * 统一输入框：
 * - 计数在框内右侧（单行）/ 右下（多行），接近上限变色，到上限变红
 * - 有内容且聚焦时出现“清除”
 * - 聚焦时整框描边与光环用服务强调色
 */
export function TextField({ value, onChange, label, max, placeholder, multiline, rows = 3, clearable = true, prefix, trailing, invalid, disabled, onEnter, onBlur, inputRef, inputMode, type, autoFocus, className }: {
  value: string; onChange: (v: string) => void; label: string; max?: number; placeholder?: string; multiline?: boolean; rows?: number
  clearable?: boolean; prefix?: ReactNode; trailing?: ReactNode; invalid?: boolean; disabled?: boolean
  onEnter?: () => void; onBlur?: () => void; inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>
  inputMode?: 'numeric' | 'text'; type?: string; autoFocus?: boolean; className?: string
}) {
  const [focus, setFocus] = useState(false)
  const n = value.length
  const near = max != null && n >= max * 0.9
  const counter = max != null && (focus || n > 0) && (
    <span aria-hidden className={cx('shrink-0 text-eyebrow tabular-nums transition-colors', n >= (max ?? 0) ? 'font-semibold text-danger' : near ? 'text-accent-ink' : 'text-ink-3')}>{n}/{max}</span>
  )
  const clear = clearable && focus && n > 0 && !disabled && (
    <button type="button" aria-label={`清除${label}`} onMouseDown={(e) => e.preventDefault()} onClick={() => onChange('')} className="grid size-5 shrink-0 place-items-center rounded-full bg-mark text-ink-2 hover:bg-ink-3 hover:text-surface"><X className="size-3" strokeWidth={3} /></button>
  )
  const shell = cx('relative flex rounded-control border bg-surface transition-[border-color,box-shadow] hover:border-ink-3',
    invalid ? 'border-danger' : focus ? 'border-accent ring-4 ring-accent/20' : 'border-line', disabled && 'pointer-events-none opacity-50', className)
  const common = {
    value, disabled, placeholder, 'aria-label': label, autoFocus,
    onChange: (e: { target: { value: string } }) => onChange(max != null ? e.target.value.slice(0, max) : e.target.value),
    onFocus: () => setFocus(true), onBlur: () => { setFocus(false); onBlur?.() },
  }
  if (multiline) {
    return (
      <div className={shell}>
        <textarea ref={inputRef as Ref<HTMLTextAreaElement>} rows={rows} {...common} className="w-full resize-none bg-transparent px-3 pb-7 pt-2.5 text-body outline-none placeholder:text-ink-3" />
        <span className="pointer-events-none absolute bottom-1.5 right-3 flex items-center gap-2">{counter}</span>
      </div>
    )
  }
  return (
    <div className={cx(shell, 'h-11 items-center gap-2 px-3')}>
      {prefix}
      <input ref={inputRef as Ref<HTMLInputElement>} type={type} inputMode={inputMode} {...common}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter && !e.nativeEvent.isComposing) { e.preventDefault(); onEnter() } }}
        className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink-3" />
      {trailing}{clear}{counter}
    </div>
  )
}
