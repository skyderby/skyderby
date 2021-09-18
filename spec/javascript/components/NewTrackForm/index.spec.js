import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import createModalRoot from 'testHelpers/createModalRoot.js'
import NewTrackForm from 'components/NewTrackForm'

describe('NewTrackForm', () => {
  beforeAll(createModalRoot)

  const defaultProps = {
    isShown: true,
    onHide: () => undefined
  }

  describe('validations', () => {
    it('suit from select is required', async () => {
      const screen = renderWithAllProviders(<NewTrackForm {...defaultProps} />)

      fireEvent.click(screen.getByText('Upload'))

      await waitFor(() => {
        expect(screen.getByText('Suit field is required')).toBeInTheDocument()
      })
    })

    it('suit from input is required', async () => {
      const screen = renderWithAllProviders(<NewTrackForm {...defaultProps} />)

      fireEvent.click(screen.getByText('Enter suit name'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter suit name')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Upload'))

      await waitFor(() => {
        expect(screen.getByText('Suit field is required')).toBeInTheDocument()
      })
    })

    it('location is required', async () => {
      const screen = renderWithAllProviders(<NewTrackForm {...defaultProps} />)

      fireEvent.click(screen.getByText('Upload'))

      await waitFor(() => {
        expect(screen.getByText('Location field is required')).toBeInTheDocument()
      })
    })
  })
})
