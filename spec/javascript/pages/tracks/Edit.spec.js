import React from 'react'
import nock from 'nock'
import { screen, waitFor } from '@testing-library/react'
import I18n from 'i18n-js'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import trackPoints from 'fixtures/trackPoints'

import Edit from 'pages/tracks/Edit'

describe('Tracks/Edit', () => {
  it('200 Success', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(200, {
        editable: true,
        downloadable: true,
        id: 11000,
        kind: 'skydive',
        comment: '',
        profileId: 3,
        suitId: 319,
        placeId: 57,
        dataFrequency: '5.0',
        pilotName: null,
        suitName: null,
        placeName: 'Ague_de_Plan',
        createdAt: '10.08.2020',
        recordedAt: '26.09.2015',
        jumpRange: { from: 126, to: 229 },
        hasVideo: false
      })

      .get('/api/v1/tracks/11000/points?trimmed=false')
      .reply(200, trackPoints)

      .get('/api/v1/profiles/3')
      .reply(200, { id: 3, name: 'Aleksandr Kunin' })

      .get('/api/v1/places/57')
      .reply(200, { id: 57, name: 'Aiguille du Plan', countryId: 14 })

      .get('/api/v1/countries/14')
      .reply(200, { id: 14, name: 'France', code: 'FRA' })

      .get('/api/v1/suits/319')
      .reply(200, { id: 319, name: 'Inspire', make: 'Air Glide', makeCode: 'AG' })

    renderWithAllProviders(
      <Edit match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() => expect(screen.getByText(I18n.t('general.save'))))
  })

  it('404 Not Found', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(404, { error: 'Not Found' })

    const { history } = renderWithAllProviders(
      <Edit match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() => expect(history.location.pathname).toEqual('/tracks'))
  })

  it('403 Forbidden', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(403, { error: 'Forbidden' })

    const { history } = renderWithAllProviders(
      <Edit match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() => expect(history.location.pathname).toEqual('/tracks'))
  })

  it('500 Server Error', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(500, { error: 'Internal Server Error' })

    renderWithAllProviders(
      <Edit match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() => expect(screen.getByText('500')).toBeInTheDocument())
    expect(screen.getByText('Server error')).toBeInTheDocument()
    expect(screen.getByText('Go back')).toHaveAttribute('href', '/tracks')
  })
})
