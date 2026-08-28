import type { HealthObservationRow } from '../types'

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return value.trim() !== '' && Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'object' && value !== null) {
    const parsed = Number(String(value))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

type Component = { code?: unknown; valueQuantity?: unknown }

function readComponents(value: unknown): Component[] {
  return Array.isArray(value) ? (value as Component[]) : []
}

export function formatObservationValue(row: HealthObservationRow): string {
  if (row.type === 'BLOOD_PRESSURE') {
    const components = readComponents(row.components)
    const systolic = components.find((item) => item.code === '8480-6')
    const diastolic = components.find((item) => item.code === '8462-4')
    const sys = toFiniteNumber(systolic?.valueQuantity)
    const dia = toFiniteNumber(diastolic?.valueQuantity)
    if (sys !== null && dia !== null) return `${Math.round(sys)}/${Math.round(dia)} mmHg`
    return 'Recorded (pair stored)'
  }

  const value = toFiniteNumber(row.valueNormalized)
  if (value === null) return '—'
  const unit = row.unitNormalized ?? ''
  const places = row.type === 'HEART_RATE' || row.type === 'SPO2' || row.type === 'PAIN' ? 0 : 1
  return unit ? `${value.toFixed(places)} ${unit}` : value.toFixed(places)
}

export function formatPatientName(row: HealthObservationRow): string {
  const name = row.patient.displayName?.trim()
  if (name) return name
  return `Patient ${row.patientId.slice(-6)}`
}
