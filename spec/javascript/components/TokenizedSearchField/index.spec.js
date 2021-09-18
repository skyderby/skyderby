import React from 'react'
import renderWithAllProviders, { queryClient } from 'testHelpers/renderWithAllProviders'
import { screen, fireEvent, waitFor, within } from '@testing-library/react'

import TokenizedSearchField from 'components/TokenizedSearchField'

describe('TokenizedSearchField', () => {
  const baseProps = {
    initialValues: [],
    onChange: () => undefined
  }

  beforeEach(() => {
    const queryOptions = {
      cacheTime: Infinity,
      staleTime: Infinity
    }

    queryClient.setQueryData(
      ['suits', 3],
      { id: 3, name: 'Nala', makeId: 1 },
      queryOptions
    )
    queryClient.setQueryData(
      ['manufacturers', 1],
      { id: 1, name: 'TonySuits', code: 'TS' },
      queryOptions
    )
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('empty state', () => {
    it('displays placeholder', () => {
      renderWithAllProviders(<TokenizedSearchField {...baseProps} />)

      expect(screen.queryByText('Search or filter tracks')).toBeInTheDocument()
    })

    it('hide clear button', () => {
      renderWithAllProviders(<TokenizedSearchField {...baseProps} />)

      expect(screen.queryByTitle('Clear all')).not.toBeInTheDocument()
    })
  })

  describe('with values', () => {
    it('show clear button', async () => {
      renderWithAllProviders(
        <TokenizedSearchField {...baseProps} initialValues={[['year', 2018]]} />
      )

      await waitFor(() => expect(screen.queryByTitle('Clear all')).toBeInTheDocument())
    })
  })

  it('loading value presentation', async () => {
    renderWithAllProviders(
      <TokenizedSearchField
        {...baseProps}
        initialValues={[
          ['year', 2018],
          ['suitId', 3]
        ]}
      />
    )

    await waitFor(() => expect(screen.getByTitle('year: 2018')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByTitle('Suit: Nala')).toBeInTheDocument())
  })

  it('displays type select on click', async () => {
    renderWithAllProviders(<TokenizedSearchField {...baseProps} />)

    fireEvent.keyDown(await screen.findByLabelText('Select filter criteria'), {
      key: 'ArrowDown',
      code: 'ArrowDown'
    })

    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Place')).toBeInTheDocument()
    expect(screen.getByText('Suit')).toBeInTheDocument()
    expect(screen.getByText('Year')).toBeInTheDocument()
  })

  it('adding filter', async () => {
    const handleChange = jest.fn()

    renderWithAllProviders(
      <TokenizedSearchField {...baseProps} onChange={handleChange} />
    )

    fireEvent.keyDown(await screen.findByLabelText('Select filter criteria'), {
      key: 'ArrowDown',
      code: 'ArrowDown'
    })
    fireEvent.click(await screen.findByText('Year'))
    fireEvent.click(await screen.findByText('2018'))

    await waitFor(() => expect(screen.getByTitle('year: 2018')).toBeInTheDocument())
    expect(handleChange).toHaveBeenCalledWith([['year', 2018]])
  })

  it('delete single value', async () => {
    const handleChange = jest.fn()

    renderWithAllProviders(
      <TokenizedSearchField
        {...baseProps}
        initialValues={[
          ['year', 2018],
          ['suitId', 3]
        ]}
        onChange={handleChange}
      />
    )

    const yearToken = await screen.findByTitle('year: 2018')

    fireEvent.click(within(yearToken).getByTitle('Delete'))

    await waitFor(() => expect(screen.queryByTitle('year: 2018')).not.toBeInTheDocument())
    expect(handleChange).toHaveBeenCalledWith([['suitId', 3]])
  })

  it('delete all', async () => {
    const handleChange = jest.fn()

    renderWithAllProviders(
      <TokenizedSearchField
        {...baseProps}
        initialValues={[
          ['year', 2018],
          ['suitId', 3]
        ]}
        onChange={handleChange}
      />
    )

    const clearButton = await screen.findByTitle('Clear all')

    fireEvent.click(clearButton)

    await waitFor(() => expect(screen.queryByTitle('year: 2018')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.queryByTitle('suit: Nala')).not.toBeInTheDocument())
    expect(handleChange).toHaveBeenCalledWith([])
  })
})
