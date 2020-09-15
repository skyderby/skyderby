import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import NewTrackForm from 'components/NewTrackForm'

describe('NewTrackForm', () => {
  describe('conditional field visibility', () => {
    it('name visible when not logged in', () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={false} />)

      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
    })

    it('name is not visible when logged in', () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={true} />)

      expect(screen.queryByPlaceholderText('Pilot')).not.toBeInTheDocument()
    })

    it('visibility button group is visible when logged in', () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={true} />)

      expect(screen.queryByText('Visibility')).toBeInTheDocument()
      expect(screen.queryByText('Public')).toBeInTheDocument()
      expect(screen.queryByText('Unlisted')).toBeInTheDocument()
      expect(screen.queryByText('Private')).toBeInTheDocument()
    })

    it('visibility button group is hidden when logged in', () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={false} />)

      expect(screen.queryByText('Visibility')).not.toBeInTheDocument()
      expect(screen.queryByText('Public')).not.toBeInTheDocument()
      expect(screen.queryByText('Unlisted')).not.toBeInTheDocument()
      expect(screen.queryByText('Private')).not.toBeInTheDocument()
    })
  })

  describe('validations', () => {
    it('name is required when not logged in', async () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={false} />)

      fireEvent.click(screen.getByText('Upload'))

      await waitFor(() => {
        expect(screen.getByText('Name field is required')).toBeInTheDocument()
      })
    })

    it('suit from select is required', async () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={true} />)

      fireEvent.click(screen.getByText('Upload'))

      await waitFor(() => {
        expect(screen.getByText('Suit field is required')).toBeInTheDocument()
      })
    })

    it('suit from input is required', async () => {
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={true} />)

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
      const screen = renderWithAllProviders(<NewTrackForm loggedIn={true} />)

      fireEvent.click(screen.getByText('Upload'))

      await waitFor(() => {
        expect(screen.getByText('Location field is required')).toBeInTheDocument()
      })
    })
  })
})
