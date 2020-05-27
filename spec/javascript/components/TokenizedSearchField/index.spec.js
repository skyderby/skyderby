import React from 'react'
import { screen, render, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import TokenizedSearchField from 'components/TokenizedSearchField'

describe('TokenizedSearchField', () => {
  const yearType = {
    type: 'year',
    label: 'Year',
    getOptions: async input =>
      [2015, 2016, 2017, 2018, 2019]
        .map(year => ({ value: year, label: year.toString() }))
        .filter(({ label }) => label.includes(input)),
    loadOption: async value => ({ value, label: value.toString() })
  }

  const suitType = {
    type: 'suit',
    label: 'Suit',
    getOptions: async input =>
      ['Pache', 'Host', 'ABC']
        .map(suit => ({ value: suit, label: suit }))
        .filter(({ label }) => label.includes(input)),
    loadOption: async value => ({ value, label: value })
  }

  const baseProps = {
    initialValues: [],
    onChange: () => {},
    dataTypes: [suitType, yearType]
  }

  describe('initial state', () => {
    it('displays placeholder when empty', () => {
      render(<TokenizedSearchField {...baseProps} />)

      const searchInput = screen.getByLabelText('Search or filter tracks')
      expect(searchInput.placeholder).toEqual('Search or filter tracks')
    })

    it('hide clear button when empty', () => {
      render(<TokenizedSearchField {...baseProps} />)

      expect(screen.queryByTitle('Clear')).not.toBeInTheDocument()
    })

    it('loading value presentation', async () => {
      render(
        <TokenizedSearchField
          {...baseProps}
          initialValues={[
            { type: 'year', value: 2018 },
            { type: 'suit', value: 'ABC' }
          ]}
        />
      )

      await waitFor(() => expect(screen.getByTitle('year: 2018')).toBeInTheDocument())
      await waitFor(() => expect(screen.getByTitle('suit: ABC')).toBeInTheDocument())
    })
  })

  it('displays type select on click', async () => {
    render(<TokenizedSearchField {...baseProps} />)

    fireEvent.click(screen.getByLabelText('Search or filter tracks'))

    const typeOptions = within(screen.getByTestId('type-dropdown'))
      .getAllByRole('listitem')
      .map(node => node.textContent)

    expect(typeOptions).toEqual(baseProps.dataTypes.map(el => el.label))
  })

  it('adding filter', async () => {
    render(<TokenizedSearchField {...baseProps} />)

    fireEvent.click(screen.getByLabelText('Search or filter tracks'))
    fireEvent.click(screen.getByText('Year'))

    fireEvent.click(await screen.findByText('2018'))

    await waitFor(() => expect(screen.getByTitle('year: 2018')).toBeInTheDocument())
  })
})
