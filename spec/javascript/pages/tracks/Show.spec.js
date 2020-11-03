import React from 'react'
import nock from 'nock'
import { screen, waitFor } from '@testing-library/react'

import renderWithAllProviders from 'testHelpers/renderWithAllProviders'
import createModalRoot from 'testHelpers/createModalRoot'
import trackPoints from 'fixtures/trackPoints'

import Show from 'pages/tracks/Show'

describe('Tracks/Show', () => {
  beforeAll(() => createModalRoot())

  it('200 Success', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(200, {
        permissions: {
          canEdit: false,
          canDownload: false
        },
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

      .get('/api/v1/tracks/11000/weather_data')
      .reply(200, [])

      .get('/api/v1/tracks/11000/points')
      .reply(200, trackPoints)

      .get('/api/v1/profiles/3')
      .reply(200, { id: 3, name: 'Aleksandr Kunin' })

      .get('/api/v1/places/57')
      .reply(200, { id: 57, name: 'Aiguille du Plan', countryId: 14 })

      .get('/api/v1/countries/14')
      .reply(200, { id: 14, name: 'France', code: 'FRA' })

      .get('/api/v1/suits/319')
      .reply(200, { id: 319, name: 'Inspire', makeId: 17 })

      .get('/api/v1/manufacturers/17')
      .reply(200, { id: 17, name: 'Air Glide', code: 'AG' })

    renderWithAllProviders(
      <Show match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await screen.findByText('Aiguille du Plan')

    expect(screen.getByText('Aleksandr Kunin')).toBeInTheDocument()
    expect(screen.getByText('Inspire')).toBeInTheDocument()
  })

  it('404 Not Found', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(404, { error: 'Not Found' })

    renderWithAllProviders(
      <Show match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() =>
      expect(screen.getByText('404', { exact: false })).toBeInTheDocument()
    )
    expect(
      screen.getByText("We were looking everywhere but we didn't find it")
    ).toBeInTheDocument()
    expect(screen.getByText('Go back')).toHaveAttribute('href', '/tracks')
  })

  it('403 Forbidden', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(403, { error: 'Forbidden' })

    renderWithAllProviders(
      <Show match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() =>
      expect(screen.getByText("Nope, you're not allowed.")).toBeInTheDocument()
    )
    expect(screen.getByText('Go back')).toHaveAttribute('href', '/tracks')
  })

  it('500 Server Error', async () => {
    nock('http://skyderby.test')
      .get('/api/v1/tracks/11000')
      .reply(500, { error: 'Internal Server Error' })

    renderWithAllProviders(
      <Show match={{ params: { id: '11000' } }} location={{ search: '' }} />
    )

    await waitFor(() =>
      expect(screen.getByText('500', { exact: false })).toBeInTheDocument()
    )
    expect(screen.getByText("It's our fault not yours")).toBeInTheDocument()
    expect(screen.getByText('Go back')).toHaveAttribute('href', '/tracks')
  })
})
