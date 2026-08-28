export const DOCUMENT_CATEGORIES = [
  'ASSESSMENT',
  'LAB',
  'PROTOCOL',
  'CONSENT',
  'GUIDE',
  'OTHER',
] as const

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  ASSESSMENT: 'Assessment',
  LAB: 'Lab',
  PROTOCOL: 'Protocol',
  CONSENT: 'Consent',
  GUIDE: 'Guide',
  OTHER: 'Other',
}
