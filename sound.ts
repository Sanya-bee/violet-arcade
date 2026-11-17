// Синтезированные звуки через WebAudio, без файлов. Контекст создаётся по первому жесту (требование Safari).
let ctx: AudioContext | null = null
const tone = (f: number, t0: number, d: number, vol: number, type: OscillatorType = 'sine') => {
  if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = f
  g.gain.setValueAtTime(0.0001, ctx.currentTime + t0)
  g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), ctx.currentTime + t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + d)
  o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + d + 0.02)
}
export function playSound(kind: 'move' | 'draw' | 'error' | 'win', on: boolean, volume: number) {
  if (!on || volume <= 0) return
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = ctx ?? new AC(); if (ctx.state === 'suspended') void ctx.resume()
    const v = volume * 0.25
    if (kind === 'move') tone(520, 0, 0.07, v)
    else if (kind === 'draw') tone(740, 0, 0.06, v)
    else if (kind === 'error') tone(150, 0, 0.14, v, 'sawtooth')
    else [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, v))
  } catch { /* звук необязателен */ }
}
