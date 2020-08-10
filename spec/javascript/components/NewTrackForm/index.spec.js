import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import I18n from 'i18n-js'

import NewTrackForm from 'components/NewTrackForm'

describe('NewTrackForm', () => {
  describe('conditional field visibility', () => {
    it('name visible when not logged in', () => {
      const screen = render(<NewTrackForm loggedIn={false} />)

      expect(
        screen.queryByPlaceholderText(I18n.t('static_pages.index.track_form.name_plh'))
      ).toBeInTheDocument()
    })

    it('name is not visible when logged in', () => {
      const screen = render(<NewTrackForm loggedIn={true} />)

      expect(
        screen.queryByPlaceholderText(I18n.t('static_pages.index.track_form.name_plh'))
      ).not.toBeInTheDocument()
    })

    it('visibility button group is visible when logged in', () => {
      const screen = render(<NewTrackForm loggedIn={true} />)

      expect(screen.queryByText(I18n.t('tracks.edit.visibility'))).toBeInTheDocument()
      expect(screen.queryByText(I18n.t('visibility.public'))).toBeInTheDocument()
      expect(screen.queryByText(I18n.t('visibility.unlisted'))).toBeInTheDocument()
      expect(screen.queryByText(I18n.t('visibility.private'))).toBeInTheDocument()
    })

    it('visibility button group is hidden when logged in', () => {
      const screen = render(<NewTrackForm loggedIn={false} />)

      expect(screen.queryByText(I18n.t('tracks.edit.visibility'))).not.toBeInTheDocument()
      expect(screen.queryByText(I18n.t('visibility.public'))).not.toBeInTheDocument()
      expect(screen.queryByText(I18n.t('visibility.unlisted'))).not.toBeInTheDocument()
      expect(screen.queryByText(I18n.t('visibility.private'))).not.toBeInTheDocument()
    })
  })

  describe('validations', () => {
    it('name is required when not logged in', async () => {
      const screen = render(<NewTrackForm loggedIn={false} />)

      fireEvent.click(screen.getByText(I18n.t('static_pages.index.track_form.submit')))

      await waitFor(() => {
        expect(screen.getByText('Name field is required')).toBeInTheDocument()
      })
    })

    it('suit from select is required', async () => {
      const screen = render(<NewTrackForm loggedIn={true} />)

      fireEvent.click(screen.getByText(I18n.t('static_pages.index.track_form.submit')))

      await waitFor(() => {
        expect(screen.getByText('Suit field is required')).toBeInTheDocument()
      })
    })

    it('suit from input is required', async () => {
      const screen = render(<NewTrackForm loggedIn={true} />)

      fireEvent.click(screen.getByText(I18n.t('tracks.form.toggle_suit_link')))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(I18n.t('tracks.form.suit_text_placeholder'))
        ).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText(I18n.t('static_pages.index.track_form.submit')))

      await waitFor(() => {
        expect(screen.getByText('Suit field is required')).toBeInTheDocument()
      })
    })

    it('location is required', async () => {
      const screen = render(<NewTrackForm />)

      fireEvent.click(screen.getByText(I18n.t('static_pages.index.track_form.submit')))

      await waitFor(() => {
        expect(screen.getByText('Location field is required')).toBeInTheDocument()
      })
    })
  })
})
