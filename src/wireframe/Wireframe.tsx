import { useEffect, useRef } from 'react'
import markup from './markup.html?raw'
// @ts-expect-error 线框交互引擎（原样移植）
import { mount } from './engine.js'

/** Codex 线框的忠实移植：结构与交互不变，样式改由 global.css 变量驱动 */
export function Wireframe() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current && !ref.current.dataset.mounted) {
      ref.current.dataset.mounted = '1'
      mount()
      const el = ref.current
      el.querySelector<HTMLSelectElement>('#s-direction')?.addEventListener('change', (e) => {
        const v = (e.target as HTMLSelectElement).value
        if (v) el.dataset.direction = v
        else delete el.dataset.direction
      })
    }
  }, [])
  return <div ref={ref} id="geo-services" className="geo" aria-label="洞点服务入口" dangerouslySetInnerHTML={{ __html: markup }} />
}
