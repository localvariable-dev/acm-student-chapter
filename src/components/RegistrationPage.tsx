import { FormEvent, useEffect, useRef, useState } from 'react'
import { Arrow } from './Arrow'
import { applicationUrl } from '../data/content'
import { applicationEndpoint } from '../config/applicationsApi'

type Application = {
  name: string
  contactNumber: string
  email: string
  rollNo: string
  gender: '' | 'Male' | 'Female'
  year: '' | 'SE' | 'TE'
  domain: '' | 'Event Management' | 'PR & Media' | 'Marketing' | 'Design & Creative' | 'Tech Team' | 'Data Team'
  experience: string
}

type Field = keyof Application
type FieldErrors = Partial<Record<Field, string>>

const emptyApplication: Application = {
  name: '', contactNumber: '', email: '', rollNo: '', gender: '', year: '', domain: '', experience: '',
}

const domainOptions: Exclude<Application['domain'], ''>[] = [
  'Event Management', 'PR & Media', 'Marketing', 'Design & Creative', 'Tech Team', 'Data Team',
]

const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
const homePath = basePath

function pagePath(path: string) {
  return `${basePath}${path.replace(/^\/+/, '')}`
}

function validateApplication(values: Application): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.name.trim()) errors.name = 'Enter your name.'
  else if (values.name.trim().length > 100) errors.name = 'Use 100 characters or fewer.'

  const digits = values.contactNumber.replace(/\D/g, '')
  if (!values.contactNumber.trim()) errors.contactNumber = 'Enter your contact number.'
  else if (!/^[+\d().\s-]+$/.test(values.contactNumber.trim()) || digits.length < 7 || digits.length > 20) {
    errors.contactNumber = 'Enter a valid contact number.'
  }

  if (!values.email.trim()) errors.email = 'Enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) || values.email.trim().length > 254) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.rollNo.trim()) errors.rollNo = 'Enter your roll number.'
  else if (values.rollNo.trim().length > 32) errors.rollNo = 'Use 32 characters or fewer.'
  if (!values.gender) errors.gender = 'Choose an option.'
  if (!values.year) errors.year = 'Choose an option.'
  if (!values.domain) errors.domain = 'Choose a domain.'
  if (values.experience.length > 2000) errors.experience = 'Use 2,000 characters or fewer.'
  return errors
}

function RegistrationPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [values, setValues] = useState<Application>(emptyApplication)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [honeypot, setHoneypot] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

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

  function updateField(field: Field, value: string) {
    setValues(current => ({ ...current, [field]: value }))
    if (errors[field]) setErrors(current => ({ ...current, [field]: undefined }))
    if (status === 'error') {
      setStatus('idle')
      setStatusMessage('')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const nextErrors = validateApplication(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus('idle')
      setStatusMessage('Review the highlighted fields and try again.')
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }

    setStatus('submitting')
    setStatusMessage('Sending your application…')
    const endpoint = applicationEndpoint()
    if (!endpoint) {
      setStatus('error')
      setStatusMessage('Application submission is not configured for this site yet. Please use the Google Form fallback below.')
      return
    }
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot }),
        signal: controller.signal,
      })
      const result = await response.json().catch(() => null) as { success?: boolean; message?: string } | null
      if (!response.ok || result?.success !== true) {
        throw new Error(result?.message || 'We could not confirm that your application was recorded.')
      }
      setStatus('success')
      setStatusMessage('Your application was recorded successfully. Thank you.')
    } catch {
      setStatus('error')
      setStatusMessage('Your application was not confirmed. Your entries are still here; please try again or use the Google Form fallback below.')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  function fieldError(field: Field) {
    return errors[field] ? <span className="field-error" id={`${field}-error`}>{errors[field]}</span> : null
  }

  const describedBy = (field: Field, hint?: string) => [hint, errors[field] ? `${field}-error` : undefined].filter(Boolean).join(' ') || undefined

  return <>
    <a className="skip-link" href="#registration-form">Skip to application form</a>
    <div className="registration-page">
      <header className="registration-header">
        <nav className="registration-nav shell" aria-label="Primary navigation">
          <a className="wordmark" href={homePath} aria-label="ACM Student Chapter home"><span>ACM</span><i>Student Chapter</i></a>
          <div id="registration-links" className={menuOpen ? 'registration-nav-links open' : 'registration-nav-links'}>
            <a onClick={() => setMenuOpen(false)} href={`${homePath}#about`}>About</a>
            <a onClick={() => setMenuOpen(false)} href={`${homePath}#explore`}>Explore</a>
            <a onClick={() => setMenuOpen(false)} href={pagePath('register')} aria-current="page">Registration</a>
            <a className="nav-join mobile-join" onClick={() => setMenuOpen(false)} href={homePath}>Back to home <Arrow /></a>
          </div>
          <a className="nav-join" href={homePath}>Back to home <Arrow /></a>
          <button ref={menuButtonRef} className="menu-button registration-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-controls="registration-links" aria-expanded={menuOpen}><span /><span /></button>
        </nav>
      </header>

      <main className="registration-main" id="main-content">
        <div className="registration-shell">
          <a className="registration-back" href={homePath}>← <span>Back to the chapter</span></a>
          <div className="registration-heading">
            <p className="eyebrow">Membership application · DIT Pimpri</p>
            <h1>Join the <em>Chapter.</em></h1>
            <p>Students in Second Year (SE) and Third Year (TE) at Dr. D. Y. Patil Institute of Technology, Pimpri are eligible to apply. Prior coding experience is not required; technical and non-technical contributions are welcome.</p>
          </div>

          <form className="application-form" id="registration-form" onSubmit={handleSubmit} noValidate>
            <div className="form-intro"><span>APPLICATION FORM</span><span><b>*</b> Required fields</span></div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Leave this field empty</label>
              <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={event => setHoneypot(event.target.value)} />
            </div>
            <div className="form-fields">
              <div className="form-field">
                <label htmlFor="name">Name <b aria-hidden="true">*</b></label>
                <input id="name" name="name" type="text" autoComplete="name" maxLength={100} required value={values.name} onChange={event => updateField('name', event.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} />
                {fieldError('name')}
              </div>
              <div className="form-field">
                <label htmlFor="contactNumber">Contact Number <b aria-hidden="true">*</b></label>
                <input id="contactNumber" name="contactNumber" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} required value={values.contactNumber} onChange={event => updateField('contactNumber', event.target.value)} aria-invalid={Boolean(errors.contactNumber)} aria-describedby={describedBy('contactNumber')} />
                {fieldError('contactNumber')}
              </div>
              <div className="form-field">
                <label htmlFor="email">Email <b aria-hidden="true">*</b></label>
                <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={values.email} onChange={event => updateField('email', event.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} />
                {fieldError('email')}
              </div>
              <div className="form-field">
                <label htmlFor="rollNo">Roll No. <b aria-hidden="true">*</b></label>
                <input id="rollNo" name="rollNo" type="text" autoComplete="off" maxLength={32} required value={values.rollNo} onChange={event => updateField('rollNo', event.target.value)} aria-invalid={Boolean(errors.rollNo)} aria-describedby={describedBy('rollNo')} />
                {fieldError('rollNo')}
              </div>
              <div className="form-field">
                <label htmlFor="gender">Gender <b aria-hidden="true">*</b></label>
                <select id="gender" name="gender" required value={values.gender} onChange={event => updateField('gender', event.target.value)} aria-invalid={Boolean(errors.gender)} aria-describedby={describedBy('gender')}>
                  <option value="">Select an option</option><option>Male</option><option>Female</option>
                </select>
                {fieldError('gender')}
              </div>
              <div className="form-field">
                <label htmlFor="year">Year <b aria-hidden="true">*</b></label>
                <select id="year" name="year" required value={values.year} onChange={event => updateField('year', event.target.value)} aria-invalid={Boolean(errors.year)} aria-describedby={describedBy('year')}>
                  <option value="">Select an option</option><option>SE</option><option>TE</option>
                </select>
                {fieldError('year')}
              </div>
              <div className="form-field form-field-wide">
                <label htmlFor="domain">Domain <b aria-hidden="true">*</b></label>
                <select id="domain" name="domain" required value={values.domain} onChange={event => updateField('domain', event.target.value)} aria-invalid={Boolean(errors.domain)} aria-describedby={describedBy('domain')}>
                  <option value="">Choose a domain</option>{domainOptions.map(option => <option key={option}>{option}</option>)}
                </select>
                {fieldError('domain')}
              </div>
              <div className="form-field form-field-wide">
                <label htmlFor="experience">Experience or prior work <span className="optional-label">Optional</span></label>
                <textarea id="experience" name="experience" rows={5} maxLength={2000} value={values.experience} onChange={event => updateField('experience', event.target.value)} aria-invalid={Boolean(errors.experience)} aria-describedby={describedBy('experience', 'experience-hint')} />
                <span className="field-hint" id="experience-hint">Share anything relevant you would like us to know. (2,000 characters maximum)</span>
                {fieldError('experience')}
              </div>
            </div>

            <div className="form-actions">
              <button className="button button-primary form-submit" type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending application…' : 'Submit application'} {status !== 'submitting' && <Arrow />}
              </button>
              <p className={`form-status ${status}`} role="status" aria-live="polite">{statusMessage}</p>
            </div>
            {submitted && Object.keys(errors).length > 0 && <span className="sr-only" role="alert">There are fields that need your attention.</span>}
            <div className="privacy-note">Submitted application information is recorded in the chapter’s designated Google Sheet for application handling.</div>
            <p className="fallback-note">Prefer the existing form? <a href={applicationUrl} target="_blank" rel="noreferrer">Continue with the Google Form <Arrow /></a></p>
          </form>
          <p className="registration-fee-note"><strong>Registration fees may be involved*</strong></p>
        </div>
      </main>

      <footer className="registration-footer">
        <div className="shell footer-top"><a className="wordmark" href={homePath}><span>ACM</span><i>Student Chapter</i></a><p>Dr. D. Y. Patil Institute of Technology<br />Pimpri, Pune, Maharashtra, India</p><div><a href={homePath}>Home</a><a href={applicationUrl} target="_blank" rel="noreferrer">Google Form fallback</a></div></div>
        <div className="shell footer-bottom"><span>DIT Pimpri · Pune</span><a href="https://www.acm.org/" target="_blank" rel="noreferrer">ACM — Association for Computing Machinery <Arrow /></a><span>© {new Date().getFullYear()}</span></div>
      </footer>
    </div>
  </>
}

export default RegistrationPage
