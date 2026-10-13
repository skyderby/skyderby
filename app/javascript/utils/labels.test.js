import { describe, test, expect } from 'vitest'
import Labels from './labels'

describe('Labels', () => {
  const labels = new Labels({
    'units.m': 'm',
    'charts.polar.max_ld': 'Max L/D %{value}'
  })

  test('returns the translation for a key', () => {
    expect(labels.t('units.m')).toBe('m')
  })

  test('interpolates arguments', () => {
    expect(labels.t('charts.polar.max_ld', { value: 2.5 })).toBe('Max L/D 2.5')
  })

  test('keeps unknown placeholders and falls back to the key', () => {
    expect(labels.t('charts.polar.max_ld')).toBe('Max L/D %{value}')
    expect(labels.t('missing.key')).toBe('missing.key')
  })
})
