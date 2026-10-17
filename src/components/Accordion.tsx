import { useId, useState } from 'react'

export function Accordion({ items }: { items: readonly (readonly [string, string])[] }) {
  const accordionId = useId()
  const [active, setActive] = useState<number | null>(0)
  return <div className="accordion">
    {items.map(([question, answer], index) => {
      const open = active === index
      const questionId = `${accordionId}-question-${index}`
      const answerId = `${accordionId}-answer-${index}`
      return <div className="accordion-item" key={question}>
        <h3><button id={questionId} aria-expanded={open} aria-controls={answerId} onClick={() => setActive(open ? null : index)}>{question}<span aria-hidden="true">{open ? '−' : '+'}</span></button></h3>
        <div id={answerId} role="region" aria-labelledby={questionId} hidden={!open}><p>{answer}</p></div>
      </div>
    })}
  </div>
}
