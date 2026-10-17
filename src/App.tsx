import { useEffect, useRef, useState } from 'react'
import { Accordion } from './components/Accordion'
import { Arrow } from './components/Arrow'
import { SectionHeader } from './components/SectionHeader'
import { explorationAreas, faqs, journey } from './data/content'

const nav = ['About', 'Explore', 'Journey', 'Membership'] as const
const registrationPath = `${import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`}register`

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [videoFailed, setVideoFailed] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches)
    motionPreference.addEventListener('change', updateMotionPreference)
    return () => motionPreference.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    if (!menuOpen) return () => { document.body.style.overflow = '' }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="hero" id="top">
      <img className="hero-poster" src={`${import.meta.env.BASE_URL}videos/hero-poster.jpg`} alt="" />
      {!reducedMotion && !videoFailed && <video className="hero-video" autoPlay muted loop playsInline preload="metadata" onError={() => setVideoFailed(true)} aria-hidden="true">
        <source src={`${import.meta.env.BASE_URL}videos/hero-background.mp4`} type="video/mp4" />
      </video>}
      <div className="hero-wash" />
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="ACM Student Chapter home"><span>ACM</span><i>Student Chapter</i></a>
        <div id="primary-links" className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {nav.map(item => <a key={item} onClick={() => setMenuOpen(false)} href={`#${item.toLowerCase()}`}>{item}</a>)}
          <a className="nav-join mobile-join" href={registrationPath}>Apply now <Arrow /></a>
        </div>
        <a className="nav-join desktop-join" href={registrationPath}>Become a member <Arrow /></a>
        <button ref={menuButtonRef} className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="primary-links" aria-expanded={menuOpen}><span /><span /></button>
      </nav>
      <div className="hero-content shell">
        <p className="location"><span /> DIT Pimpri · Pune</p>
        <p className="hero-kicker">Association for Computing Machinery</p>
        <h1>A shared horizon<br />for <em>curious</em> minds.</h1>
        <p className="hero-copy">A campus community for students who want to explore computing, learn with peers, build ideas, and contribute in their own way.</p>
        <div className="hero-actions"><a className="button button-primary" href="#about">Explore the chapter <Arrow /></a><a className="button button-quiet" href={registrationPath}>Become a member</a></div>
      </div>
      <a className="scroll-cue" href="#about"><span>Scroll to explore</span><b>↓</b></a>
    </header>

    <main id="main-content">
      <section className="about shell section" id="about">
        <SectionHeader eyebrow="01 — A local point of connection" title={<>Computing is more<br />meaningful <em>together.</em></>}>
          <p>ACM, the Association for Computing Machinery, is an international professional association for computing professionals, researchers, educators, and students.</p>
          <p>The ACM Student Chapter at Dr. D. Y. Patil Institute of Technology, Pimpri is a campus community that aims to bring that spirit into student life: learning, technical exploration, research, collaboration, and practical experience.</p>
          <a className="text-link" href="https://www.acm.org/" target="_blank" rel="noreferrer">Visit ACM.org <Arrow /></a>
        </SectionHeader>
        <aside className="about-aside"><span className="orb" /><p>DIT Pimpri<br />Pune, Maharashtra<br />India</p><small>Campus community<br />for computing</small></aside>
      </section>

      <section className="explore section" id="explore"><div className="shell"><SectionHeader eyebrow="02 — Areas to explore" title={<>Find the work that<br /><em>pulls you forward.</em></>}><p>These are opportunities members can explore and help develop together. They are not a promise that every activity is already underway.</p></SectionHeader>
        <div className="areas">{explorationAreas.map(([number, title, copy]) => <article className="area" key={title}><p>{number}</p><div className="area-symbol">✦</div><h3>{title}</h3><span>{copy}</span></article>)}</div>
      </div></section>

      <section className="journey section" id="journey"><div className="shell"><SectionHeader eyebrow="03 — The member journey" title={<>A path made by<br /><em>following through.</em></>}><p>An aspirational framework for your time with the community—not a prescribed curriculum or a mandatory progression.</p></SectionHeader>
        <ol className="journey-list">{journey.map(([number, title, copy]) => <li key={title}><span>{number}</span><h3>{title}</h3><p>{copy}</p><i>↘</i></li>)}</ol>
      </div></section>

      <section className="pathways section"><div className="shell pathways-grid"><div><p className="eyebrow">04 — Many ways to contribute</p><h2>There’s no single<br />way to <em>belong here.</em></h2></div><div className="pathway"><p>Technical</p><h3>Make, investigate,<br />and experiment.</h3><span>Development · AI / ML · Cybersecurity · Cloud · Projects · Research</span></div><div className="pathway warm"><p>Non-technical</p><h3>Shape how the<br />community moves.</h3><span>Design · Events · Communication · Outreach · Operations · Coordination</span></div><p className="pathways-note">No prior coding experience is required. Curiosity, a willingness to learn, and thoughtful contributions in any of these areas are welcome.</p></div></section>

      <section className="opportunities section"><div className="shell split-title"><SectionHeader eyebrow="05 — Events & opportunities" title={<>What comes next<br />is <em>open-ended.</em></>}><p>Sessions, workshops, competitions, and community initiatives can take shape as the chapter grows.</p></SectionHeader><div className="empty-state"><span>✦</span><h3>Future activities<br />will appear here.</h3><p>Confirmed chapter events and opportunities can be added when they are ready to share.</p><small>NO VERIFIED EVENTS PUBLISHED YET</small><a className="text-link" href="#explore">Explore areas to get involved <Arrow /></a></div></div></section>

      <section className="projects section"><div className="shell projects-grid"><div><p className="eyebrow">06 — Projects & community</p><h2>Space for the work<br />that starts with<br /><em>“what if?”</em></h2></div><div className="projects-copy"><p>Projects, experiments, and student contributions are an invitation to test ideas in public, learn through doing, and make progress with others.</p><p>When there are verified projects to share, this space is ready to give them a proper home.</p></div></div></section>

      <section className="membership section" id="membership"><div className="shell"><div className="membership-intro"><p className="eyebrow">07 — Membership</p><h2>Bring what you know.<br /><em>Bring what you’re curious about.</em></h2><p>Eligible SE and TE students at Dr. D. Y. Patil Institute of Technology, Pimpri can apply to join a student community built around computing, exploration, and contribution.</p><a className="button button-primary" href={registrationPath}>Open the application <Arrow /></a><small>Submitting an application does not itself guarantee membership.</small></div><div><p className="process-label">APPLICATION PROCESS</p><ol className="process"><li><span>01</span>Open the application form</li><li><span>02</span>Submit your application</li><li><span>03</span>Follow the chapter’s applicable process</li></ol><Accordion items={faqs} /></div><p className="fee-note">Registration fees may be involved*</p></div></section>

      <section className="team section"><div className="shell team-grid"><SectionHeader eyebrow="08 — Chapter team" title={<>People will make<br />this <em>matter.</em></>}><p>Verified leadership information can be introduced here once it is confirmed for publication.</p></SectionHeader><div className="team-placeholder"><span>ACM</span><p>Leadership details<br />to be confirmed.</p><small>NO TEAM PROFILES PUBLISHED</small></div></div></section>
    </main>
    <footer><div className="shell footer-top"><a className="wordmark" href="#top"><span>ACM</span><i>Student Chapter</i></a><p>Dr. D. Y. Patil Institute of Technology<br />Pimpri, Pune, Maharashtra, India</p><div><a href="#about">About</a><a href="#explore">Explore</a><a href={registrationPath}>Apply</a></div></div><div className="shell footer-bottom"><span>DIT Pimpri · Pune</span><a href="https://www.acm.org/" target="_blank" rel="noreferrer">ACM — Association for Computing Machinery <Arrow /></a><span>© {new Date().getFullYear()}</span></div></footer>
  </>
}

export default App
