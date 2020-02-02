import React from 'react'

import renderWithRedux from 'testHelpers/renderWithRedux'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
import Elevation from 'components/TrackShow/Summary/Elevation'

describe('Summary/Elevation', () => {
  it('shows elevation rounded to whole digit', () => {
    const { getByTestId } = renderWithRedux(<Elevation value={1000.373} />)

    expect(getByTestId('value')).toHaveTextContent('1000')
  })

  describe('metric units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: METRIC } }
      return renderWithRedux(<Elevation {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByTestId } = renderComponent({ value: 1000.4 })

      expect(getByTestId('value')).toHaveTextContent('1000')
    })
  })

  describe('imperial units', () => {
    const renderComponent = props => {
      const initialState = { userPreferences: { unitSystem: IMPERIAL } }
      return renderWithRedux(<Elevation {...props} />, initialState)
    }

    it('correct value', () => {
      const { getByTestId } = renderComponent({ value: 1000 })

      expect(getByTestId('value')).toHaveTextContent('3281')
    })
  })

  describe('empty values', () => {
    it('shows placeholder', () => {
      const { getByTestId } = renderWithRedux(<Elevation />)

      expect(getByTestId('value')).toHaveTextContent('----')
    })
  })
})
