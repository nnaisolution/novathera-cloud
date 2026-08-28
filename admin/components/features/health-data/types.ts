export type HealthObservationType =
  | 'WEIGHT'
  | 'BLOOD_PRESSURE'
  | 'BLOOD_GLUCOSE'
  | 'HEART_RATE'
  | 'SPO2'
  | 'BODY_TEMPERATURE'
  | 'PAIN'
  | 'HEIGHT'
  | 'RESPIRATORY_RATE'
  | 'STEPS'
  | 'OTHER'

export const HEALTH_OBSERVATION_TYPES = [
  'WEIGHT',
  'BLOOD_PRESSURE',
  'BLOOD_GLUCOSE',
  'HEART_RATE',
  'SPO2',
  'BODY_TEMPERATURE',
  'PAIN',
  'HEIGHT',
  'RESPIRATORY_RATE',
  'STEPS',
  'OTHER',
] as const satisfies readonly HealthObservationType[]

export const HEALTH_TYPE_LABELS: Record<HealthObservationType, string> = {
  WEIGHT: 'Weight',
  BLOOD_PRESSURE: 'Blood pressure',
  BLOOD_GLUCOSE: 'Blood glucose',
  HEART_RATE: 'Heart rate',
  SPO2: 'SpO₂',
  BODY_TEMPERATURE: 'Temperature',
  PAIN: 'Pain',
  HEIGHT: 'Height',
  RESPIRATORY_RATE: 'Respiratory rate',
  STEPS: 'Steps',
  OTHER: 'Other',
}

export type HealthObservationRow = {
  id: string
  patientId: string
  type: HealthObservationType
  valueNormalized: unknown
  unitNormalized: string | null
  components: unknown
  effectiveAt: string | Date
  source: string
  patient: { id: string; displayName: string | null }
}

export type HealthListResponse = {
  configured: boolean
  items: HealthObservationRow[]
  nextCursor?: string
  hint?: string
  error?: string
}
