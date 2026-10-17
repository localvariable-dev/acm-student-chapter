import type { ReactNode } from 'react'

export function SectionHeader({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return <header className="section-header">
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    {children && <div className="section-intro">{children}</div>}
  </header>
}
