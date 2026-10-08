import { useEffect, useState, type ReactNode } from 'react'
import { useEditor, EditorContent, useEditorState, type Editor as TEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { AlignCenter, AlignLeft, AlignRight, Bold, Check, Heading2, Heading3, Highlighter, Italic, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline as UIcon, Undo2 } from 'lucide-react'
import { cx } from './shared'

export const toHtml = (body: string) => body.split('\n\n').slice(1).map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`).join('')

function Btn({ on, label, onClick, disabled, children }: { on?: boolean; label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={on} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick}
      className={cx('grid size-9 place-items-center rounded-control transition-colors disabled:opacity-30', on ? 'bg-ink text-surface' : 'text-ink-2 hover:bg-sunken')}>{children}</button>
  )
}
const Sep = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden />

function Toolbar({ ed }: { ed: TEditor }) {
  const s = useEditorState({
    editor: ed,
    selector: ({ editor: e }) => ({
      h2: e.isActive('heading', { level: 2 }), h3: e.isActive('heading', { level: 3 }), b: e.isActive('bold'), i: e.isActive('italic'), u: e.isActive('underline'), s: e.isActive('strike'),
      hl: e.isActive('highlight'), ul: e.isActive('bulletList'), ol: e.isActive('orderedList'), q: e.isActive('blockquote'),
      l: e.isActive({ textAlign: 'left' }), c: e.isActive({ textAlign: 'center' }), r: e.isActive({ textAlign: 'right' }),
      undo: e.can().undo(), redo: e.can().redo(),
    }),
  })
  const c = () => ed.chain().focus()
  return (
    <div role="toolbar" aria-label="文章格式" className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface/90 p-1.5 backdrop-blur">
      <Btn label="撤销" disabled={!s.undo} onClick={() => c().undo().run()}><Undo2 className="size-4" /></Btn>
      <Btn label="重做" disabled={!s.redo} onClick={() => c().redo().run()}><Redo2 className="size-4" /></Btn><Sep />
      <Btn label="大标题" on={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></Btn>
      <Btn label="小标题" on={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="size-4" /></Btn><Sep />
      <Btn label="加粗" on={s.b} onClick={() => c().toggleBold().run()}><Bold className="size-4" /></Btn>
      <Btn label="斜体" on={s.i} onClick={() => c().toggleItalic().run()}><Italic className="size-4" /></Btn>
      <Btn label="下划线" on={s.u} onClick={() => c().toggleUnderline().run()}><UIcon className="size-4" /></Btn>
      <Btn label="删除线" on={s.s} onClick={() => c().toggleStrike().run()}><Strikethrough className="size-4" /></Btn>
      <Btn label="高亮" on={s.hl} onClick={() => c().toggleHighlight().run()}><Highlighter className="size-4" /></Btn><Sep />
      <Btn label="无序列表" on={s.ul} onClick={() => c().toggleBulletList().run()}><List className="size-4" /></Btn>
      <Btn label="有序列表" on={s.ol} onClick={() => c().toggleOrderedList().run()}><ListOrdered className="size-4" /></Btn>
      <Btn label="引用" on={s.q} onClick={() => c().toggleBlockquote().run()}><Quote className="size-4" /></Btn>
      <Btn label="分隔线" onClick={() => c().setHorizontalRule().run()}><Minus className="size-4" /></Btn><Sep />
      <Btn label="左对齐" on={s.l} onClick={() => c().setTextAlign('left').run()}><AlignLeft className="size-4" /></Btn>
      <Btn label="居中" on={s.c} onClick={() => c().setTextAlign('center').run()}><AlignCenter className="size-4" /></Btn>
      <Btn label="右对齐" on={s.r} onClick={() => c().setTextAlign('right').run()}><AlignRight className="size-4" /></Btn>
    </div>
  )
}

export function RichEditor({ html, onChange }: { html: string; onChange: (html: string, text: string) => void }) {
  const [saved, setSaved] = useState(true)
  const ed = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: '在这里写正文…' }), CharacterCount, Highlight, TextAlign.configure({ types: ['heading', 'paragraph'] })],
    content: html,
    editorProps: { attributes: { 'aria-label': '文章正文', class: 'dd-prose min-h-80 px-5 py-4 outline-none' } },
    onUpdate: ({ editor }) => { setSaved(false); onChange(editor.getHTML(), editor.getText({ blockSeparator: '\n\n' })) },
  })
  useEffect(() => {
    if (saved) return
    const t = setTimeout(() => setSaved(true), 900)
    return () => clearTimeout(t)
  }, [saved])
  if (!ed) return null
  const n = ed.storage.characterCount.characters()
  return (
    <div className="overflow-hidden rounded-control border border-line bg-surface focus-within:border-ink focus-within:ring-4 focus-within:ring-accent/20">
      <Toolbar ed={ed} />
      <EditorContent editor={ed} />
      <div className="flex items-center justify-between border-t border-line bg-sunken/50 px-4 py-2 text-caption tabular-nums text-ink-3">
        <span>{n} 字</span>
        <span className="flex items-center gap-1" aria-live="polite">{saved ? <><Check className="size-3.5" strokeWidth={3} />已自动保存</> : '保存中…'}</span>
      </div>
    </div>
  )
}
