import React from 'react'
import { render } from '@testing-library/react'

import GlideRatio from 'components/TrackInsights/Summary/GlideRatio'

describe('Summary/GlideRatio', () => {
  it('hide wind effect if no zeroWindValue provided', () => {
    const { queryByLabelText } = render(
      <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
    )

    expect(queryByLabelText('wind cancelled value')).not.toBeInTheDocument()
  })

  describe('average value', () => {
    it('normal value', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
      )

      expect(getByLabelText('average glide ratio').textContent).toBe('1.71')
    })

    it('greater than 10', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 100.7123, min: 0.2, max: 11 }} />
      )

      expect(getByLabelText('average glide ratio').textContent).toBe('≥10')
    })

    it('empty', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: null, min: 0.2, max: 11 }} />
      )

      expect(getByLabelText('average glide ratio').textContent).toBe('-.--')
    })
  })

  it('zero wind value', () => {
    const { getByLabelText } = render(
      <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} zeroWindValue={1.5} />
    )

    expect(getByLabelText('wind cancelled value').textContent).toBe('1.50')
    expect(getByLabelText('wind effect').textContent).toBe('+0.21')
  })

  describe('max value', () => {
    it('normal value', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 9 }} />
      )

      expect(getByLabelText('maximum glide ratio').textContent).toBe('9.00')
    })

    it('greater than 10', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
      )

      expect(getByLabelText('maximum glide ratio').textContent).toBe('≥10')
    })

    it('empty', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.71, min: 0.2, max: 0 / 0 }} />
      )

      expect(getByLabelText('maximum glide ratio').textContent).toBe('-.--')
    })
  })

  describe('min value', () => {
    it('normal value', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
      )

      expect(getByLabelText('minimum glide ratio').textContent).toBe('0.20')
    })

    it('greater than 10', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.7123, min: 10.2, max: 11 }} />
      )

      expect(getByLabelText('minimum glide ratio').textContent).toBe('≥10')
    })

    it('empty', () => {
      const { getByLabelText } = render(
        <GlideRatio value={{ avg: 1.71, min: undefined, max: 10 }} />
      )

      expect(getByLabelText('minimum glide ratio').textContent).toBe('-.--')
    })
  })
})
