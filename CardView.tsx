import type { CSSProperties, PointerEvent } from 'react'
import type { Card } from './engine'
import { isRed } from './engine'
const SUIT = ['♠', '♥', '♦', '♣'], RANK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const BACKS = [
  { name: 'Фиалка', css: 'repeating-linear-gradient(45deg,#6d28d9 0 6px,#5b21b6 6px 12px)' },
  { name: 'Ромбы', css: 'conic-gradient(#4c1d95 25%,#7c3aed 0 50%,#4c1d95 0 75%,#7c3aed 0) 0 0/16px 16px' },
  { name: 'Точки', css: 'radial-gradient(circle,#c4b5fd 1.5px,transparent 2px) 0 0/10px 10px,#4c1d95' },
  { name: 'Сетка', css: 'linear-gradient(#a78bfa55 1px,transparent 1px) 0 0/10px 10px,linear-gradient(90deg,#a78bfa55 1px,transparent 1px) 0 0/10px 10px,#312e81' },
  { name: 'Закат', css: 'linear-gradient(160deg,#f472b6,#8b5cf6 55%,#312e81)' },
  { name: 'Лучи', css: 'repeating-conic-gradient(#7c3aed 0 10deg,#4c1d95 10deg 20deg)' },
  { name: 'Волны', css: 'radial-gradient(circle at 50% 120%,transparent 0 40%,#a78bfa66 41% 45%,transparent 46%) 0 0/20px 14px,#3b0764' },
  { name: 'Шахматы', css: 'conic-gradient(#1e1b4b 25%,#6d28d9 0 50%,#1e1b4b 0 75%,#6d28d9 0) 0 0/20px 20px' },
]
interface Props {
  card: Card; w: number; y?: number; x?: number; back: number; face: 'classic' | 'minimal'
  selected?: boolean; hint?: boolean; hidden?: boolean; ghost?: boolean
  onDown?: (e: PointerEvent) => void
}
export default function CardView({ card, w, y = 0, x = 0, back, face, selected, hint, hidden, ghost, onDown }: Props) {
  const h = w * 1.42, red = isRed(card.s)
  const base: CSSProperties = {
    position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: w * 0.1, boxSizing: 'border-box',
    visibility: hidden ? 'hidden' : 'visible', boxShadow: '0 2px 6px rgba(0,0,0,.45)',
    outline: selected ? '3px solid #FDE047' : hint ? '3px solid #34D399' : 'none', outlineOffset: -1,
    ...(ghost ? { animation: 'none' } : {}),
  }
  if (!card.up) return <div className="sol-card" onPointerDown={onDown} style={{ ...base, background: BACKS[back].css, border: `${Math.max(2, w * 0.05)}px solid #F5F3FF` }} />
  const fs = w * 0.26, col = red ? '#DC2626' : '#18181B'
  const corner = (rot: boolean): CSSProperties => ({ position: 'absolute', [rot ? 'right' : 'left']: w * 0.07, [rot ? 'bottom' : 'top']: w * 0.04, transform: rot ? 'rotate(180deg)' : undefined, fontSize: fs, lineHeight: 1, fontWeight: 800, textAlign: 'center' })
  return (
    <div className="sol-card" onPointerDown={onDown} style={{ ...base, background: face === 'classic' ? '#FFFFFF' : '#F5F3FF', color: col }}>
      <div style={corner(false)}>{RANK[card.r]}<br />{SUIT[card.s]}</div>
      {face === 'classic'
        ? <><div style={corner(true)}>{RANK[card.r]}<br />{SUIT[card.s]}</div>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: w * (card.r > 10 ? 0.6 : 0.5), opacity: card.r > 10 ? 0.9 : 1, paddingTop: w * 0.1 }}>{card.r > 10 ? RANK[card.r] : SUIT[card.s]}</div></>
        : <div style={{ position: 'absolute', right: w * 0.1, bottom: w * 0.06, fontSize: w * 0.42, opacity: 0.9 }}>{SUIT[card.s]}</div>}
    </div>
  )
}
