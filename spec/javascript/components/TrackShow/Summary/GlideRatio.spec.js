import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import GlideRatio from 'components/TrackShow/Summary/GlideRatio'

describe('Summary/GlideRatio', () => {
  describe('average value', () => {
    it('normal value', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
      )

      expect(getByTestId('value[avg]')).toHaveTextContent('1.71')
    })

    it('greater than 10', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 100.7123, min: 0.2, max: 11 }} />
      )

      expect(getByTestId('value[avg]')).toHaveTextContent('≥10')
    })

    it('empty', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: null, min: 0.2, max: 11 }} />
      )

      expect(getByTestId('value[avg]')).toHaveTextContent('-.--')
    })
  })

  describe('max value', () => {
    it('normal value', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 9 }} />
      )

      expect(getByTestId('value[max]')).toHaveTextContent('9.00')
    })

    it('greater than 10', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
      )

      expect(getByTestId('value[max]')).toHaveTextContent('≥10')
    })

    it('empty', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.71, min: 0.2, max: 0 / 0 }} />
      )

      expect(getByTestId('value[max]')).toHaveTextContent('-.--')
    })
  })

  describe('min value', () => {
    it('normal value', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.7123, min: 0.2, max: 11 }} />
      )

      expect(getByTestId('value[min]')).toHaveTextContent('0.20')
    })

    it('greater than 10', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.7123, min: 10.2, max: 11 }} />
      )

      expect(getByTestId('value[min]')).toHaveTextContent('≥10')
    })

    it('empty', () => {
      const { getByTestId } = render(
        <GlideRatio value={{ avg: 1.71, min: undefined, max: 10 }} />
      )

      expect(getByTestId('value[min]')).toHaveTextContent('-.--')
    })
  })
})
