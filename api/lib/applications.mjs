export const APPLICATION_FIELDS = Object.freeze([
  'name',
  'contactNumber',
  'email',
  'rollNo',
  'gender',
  'year',
  'domain',
  'experience',
])

export const SHEET_HEADERS = Object.freeze([
  'Timestamp',
  'Name',
  'Contact Number',
  'Email',
  'Roll No.',
  'Gender',
  'Year',
  'Domain',
  'Experience or prior work',
])

const genders = new Set(['Male', 'Female'])
const years = new Set(['SE', 'TE'])
const domains = new Set([
  'Event Management', 'PR & Media', 'Marketing', 'Design & Creative', 'Tech Team', 'Data Team',
])
const allowedKeys = new Set([...APPLICATION_FIELDS, 'website'])

export class ApplicationInputError extends Error {
  constructor(message, fields = {}) {
    super(message)
    this.name = 'ApplicationInputError'
    this.fields = fields
  }
}

export function validateApplication(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApplicationInputError('Send a JSON object containing the application fields.')
  }

  const unexpected = Object.keys(input).filter(key => !allowedKeys.has(key))
  if (unexpected.length) throw new ApplicationInputError('The request contains unsupported fields.')

  const errors = {}
  const values = {}
  const text = (key, maxLength, { required = false } = {}) => {
    const value = input[key]
    if (value === undefined && !required) return ''
    if (typeof value !== 'string') {
      errors[key] = required ? 'This field is required and must be text.' : 'This field must be text.'
      return ''
    }
    const normalized = value.trim()
    if (required && !normalized) errors[key] = 'This field is required.'
    else if (normalized.length > maxLength) errors[key] = `Use ${maxLength} characters or fewer.`
    else if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(normalized)) errors[key] = 'Remove unsupported control characters.'
    return normalized
  }

  values.name = text('name', 100, { required: true })
  values.contactNumber = text('contactNumber', 40, { required: true })
  values.email = text('email', 254, { required: true }).toLowerCase()
  values.rollNo = text('rollNo', 32, { required: true })
  values.gender = text('gender', 10, { required: true })
  values.year = text('year', 2, { required: true })
  values.domain = text('domain', 40, { required: true })
  values.experience = text('experience', 2000)

  if (values.contactNumber && (!/^[+\d().\s-]+$/.test(values.contactNumber) || values.contactNumber.replace(/\D/g, '').length < 7 || values.contactNumber.replace(/\D/g, '').length > 20)) {
    errors.contactNumber = 'Enter a valid contact number.'
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (values.gender && !genders.has(values.gender)) errors.gender = 'Choose Male or Female.'
  if (values.year && !years.has(values.year)) errors.year = 'Choose SE or TE.'
  if (values.domain && !domains.has(values.domain)) errors.domain = 'Choose a listed domain.'

  if (Object.keys(errors).length) throw new ApplicationInputError('Review the application fields and try again.', errors)
  if (input.website !== undefined && typeof input.website !== 'string') {
    throw new ApplicationInputError('The application could not be accepted.')
  }
  if (typeof input.website === 'string' && input.website.trim()) {
    throw new ApplicationInputError('The application could not be accepted.')
  }
  return values
}

export function buildSheetRow(application, timestamp = new Date().toISOString()) {
  return [
    timestamp,
    application.name,
    application.contactNumber,
    application.email,
    application.rollNo,
    application.gender,
    application.year,
    application.domain,
    application.experience,
  ]
}
