const cubes = [
  { s: 90, t: 40, x: '8%', y: '18%' }, { s: 60, t: 55, x: '82%', y: '12%' },
  { s: 120, t: 70, x: '70%', y: '66%' }, { s: 50, t: 45, x: '20%', y: '78%' },
]
const spheres = [
  { d: 220, t: 14, x: '60%', y: '30%' }, { d: 140, t: 11, x: '4%', y: '55%' }, { d: 90, t: 9, x: '90%', y: '85%' },
]
// Лёгкий фон на чистом CSS: без WebGL, только transform/opacity. Скрывается через data-effects="off".
export default function Background() {
  return (
    <div className="bg-scene" aria-hidden>
      {cubes.map((c, i) => (
        <div key={i} className="scene3d" style={{ left: c.x, top: c.y }}>
          <div className="cube" style={{ '--s': `${c.s}px`, '--t': `${c.t}s` } as React.CSSProperties}>
            {[0, 1, 2, 3, 4, 5].map(n => <i key={n} />)}
          </div>
        </div>
      ))}
      {spheres.map((s, i) => (
        <div key={i} className="sphere" style={{ width: s.d, height: s.d, left: s.x, top: s.y, '--t': `${s.t}s` } as React.CSSProperties} />
      ))}
      <div className="shape" style={{ width: 80, height: 80, left: '45%', top: '8%', '--t': '60s', borderRadius: 16 } as React.CSSProperties} />
      <div className="shape" style={{ width: 0, height: 0, left: '35%', top: '70%', '--t': '80s', border: 0, borderLeft: '40px solid transparent', borderRight: '40px solid transparent', borderBottom: '70px solid rgb(139 92 246 / .12)' } as React.CSSProperties} />
    </div>
  )
}
