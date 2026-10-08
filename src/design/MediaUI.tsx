import { logoTone, mediaById, type Media } from './media'
import { cx } from './shared'

export function Logo({ m, size = 'size-10' }: { m: Media; size?: string }) {
  return <span aria-hidden className={cx('grid shrink-0 place-items-center rounded-control text-h3 font-black', size, logoTone[m.tone])}>{m.name.slice(0, 1)}</span>
}
export const MediaLogo = ({ id, size }: { id: string; size?: string }) => <Logo m={mediaById(id)} size={size} />
