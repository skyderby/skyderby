import React from 'react'
import renderWithAllProviders from 'jest/renderWithAllProviders'

import GlideRatio from './GlideRatio'

describe('Summary/GlideRatio', () => {
  it('hide wind effect if no zeroWindValue provided', () => {
    const { queryByLabelText } = renderWithAllProviders(
      <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} zeroWindValue={null} />
    )

    expect(queryByLabelText('wind cancelled value')).not.toBeInTheDocument()
  })

  describe('average value', () => {
    it('normal value', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} zeroWindValue={null} />
      )

      expect(getByLabelText('average glide ratio').textContent).toBe('1.71')
    })

    it('greater than 10', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 100.7123, min: 0.2, max: 11 }} zeroWindValue={null} />
      )

      expect(getByLabelText('average glide ratio').textContent).toBe('≥10')
    })

    it('empty', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: null, min: 0.2, max: 11 }} zeroWindValue={null} />
      )

      expect(getByLabelText('average glide ratio').textContent).toBe('-.--')
    })
  })

  it('zero wind value', () => {
    const { getByLabelText } = renderWithAllProviders(
      <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} zeroWindValue={1.5} />
    )

    expect(getByLabelText('wind cancelled value').textContent).toBe('1.50')
    expect(getByLabelText('wind effect').textContent).toBe('+0.21')
  })

  describe('max value', () => {
    it('normal value', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 9 }} zeroWindValue={null} />
      )

      expect(getByLabelText('maximum glide ratio').textContent).toBe('9.00')
    })

    it('greater than 10', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} zeroWindValue={null} />
      )

      expect(getByLabelText('maximum glide ratio').textContent).toBe('≥10')
    })

    it('empty', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.71, min: 0.2, max: 0 / 0 }} zeroWindValue={null} />
      )

      expect(getByLabelText('maximum glide ratio').textContent).toBe('-.--')
    })
  })

  describe('min value', () => {
    it('normal value', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} zeroWindValue={null} />
      )

      expect(getByLabelText('minimum glide ratio').textContent).toBe('0.20')
    })

    it('greater than 10', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.7123, min: 10.2, max: 11 }} zeroWindValue={null} />
      )

      expect(getByLabelText('minimum glide ratio').textContent).toBe('≥10')
    })

    it('empty', () => {
      const { getByLabelText } = renderWithAllProviders(
        <GlideRatio value={{ avg: 1.71, min: null, max: 10 }} zeroWindValue={null} />
      )

      expect(getByLabelText('minimum glide ratio').textContent).toBe('-.--')
    })
  })
})
