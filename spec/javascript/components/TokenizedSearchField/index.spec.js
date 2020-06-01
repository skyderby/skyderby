import React from 'react'
import { screen, render, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'

import TokenizedSearchField from 'components/TokenizedSearchField'

describe('TokenizedSearchField', () => {
  const yearType = {
    type: 'year',
    label: 'Year',
    getOptions: async input =>
      ['2015', '2016', '2017', '2018', '2019']
        .map(year => ({ value: year, label: year }))
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

  describe('empty state', () => {
    it('displays placeholder', () => {
      render(<TokenizedSearchField {...baseProps} />)

      const searchInput = screen.getByLabelText('Search or filter tracks')
      expect(searchInput.placeholder).toEqual('Search or filter tracks')
    })

    it('hide clear button', () => {
      render(<TokenizedSearchField {...baseProps} />)

      expect(screen.queryByTitle('Clear all')).not.toBeInTheDocument()
    })
  })

  describe('with values', () => {
    it('hide placeholder', async () => {
      render(
        <TokenizedSearchField
          {...baseProps}
          initialValues={[{ type: 'year', value: 2018 }]}
        />
      )

      const searchInput = screen.getByLabelText('Search or filter tracks')
      await waitFor(() => expect(searchInput.placeholder).toEqual(''))
    })

    it('show clear button', async () => {
      render(
        <TokenizedSearchField
          {...baseProps}
          initialValues={[{ type: 'year', value: 2018 }]}
        />
      )

      await waitFor(() => expect(screen.queryByTitle('Clear all')).toBeInTheDocument())
    })
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

  it('displays type select on click', async () => {
    render(<TokenizedSearchField {...baseProps} />)

    fireEvent.click(screen.getByLabelText('Search or filter tracks'))

    const typeOptions = within(screen.getByTestId('type-dropdown'))
      .getAllByRole('listitem')
      .map(node => node.textContent)

    expect(typeOptions).toEqual(baseProps.dataTypes.map(el => el.label))
  })

  it('adding filter', async () => {
    const handleChange = jest.fn()

    render(<TokenizedSearchField {...baseProps} onChange={handleChange} />)

    fireEvent.click(screen.getByLabelText('Search or filter tracks'))
    fireEvent.click(screen.getByText('Year'))

    fireEvent.click(await screen.findByText('2018'))

    await waitFor(() => expect(screen.getByTitle('year: 2018')).toBeInTheDocument())
    expect(handleChange).toHaveBeenCalledWith([{ type: 'year', value: '2018' }])
  })

  it('delete single value', async () => {
    const handleChange = jest.fn()

    render(
      <TokenizedSearchField
        {...baseProps}
        initialValues={[
          { type: 'year', value: 2018 },
          { type: 'suit', value: 'ABC' }
        ]}
        onChange={handleChange}
      />
    )

    const yearToken = await waitFor(() => screen.getByTitle('year: 2018'))

    fireEvent.click(within(yearToken).getByTitle('Delete'))

    await waitFor(() => expect(screen.queryByTitle('year: 2018')).not.toBeInTheDocument())
    expect(handleChange).toHaveBeenCalledWith([{ type: 'suit', value: 'ABC' }])
  })

  it('delete all', async () => {
    const handleChange = jest.fn()

    render(
      <TokenizedSearchField
        {...baseProps}
        initialValues={[
          { type: 'year', value: 2018 },
          { type: 'suit', value: 'ABC' }
        ]}
        onChange={handleChange}
      />
    )

    const clearButton = await waitFor(() => screen.getByTitle('Clear all'))

    fireEvent.click(clearButton)

    await waitFor(() => expect(screen.queryByTitle('year: 2018')).not.toBeInTheDocument())
    await waitFor(() => expect(screen.queryByTitle('suit: ABC')).not.toBeInTheDocument())
    expect(handleChange).toHaveBeenCalledWith([])
  })
})
