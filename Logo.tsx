import { Link } from 'react-router-dom'
export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Violet Arcade">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary shadow-[0_0_24px_rgb(var(--primary)/.6)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M12 2 21 7v10l-9 5-9-5V7z" /><path d="M12 22V12M3 7l9 5 9-5" /></svg>
      </span>
      <span className="text-[15px] font-extrabold tracking-[.18em]">VIOLET<span className="text-accent"> ARCADE</span></span>
    </Link>
  )
}
