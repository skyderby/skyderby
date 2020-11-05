import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react'
import renderWithAllProviders from 'testHelpers/renderWithAllProviders'

import createModalRoot from 'testHelpers/createModalRoot'
import { METRIC, IMPERIAL, SINGLE_CHART, MULTI_CHART } from 'redux/userPreferences'
import SettingsModal from 'components/TrackInsights/ViewSettings/SettingsModal'

describe('SettingsModal', () => {
  const handleSubmit = jest.fn()
  const handleHide = jest.fn()

  beforeEach(() => createModalRoot())

  const selectOption = async ({ select, getOption }) => {
    fireEvent.keyDown(select, { keyCode: 40 })
    await waitFor(() => getOption())
    fireEvent.click(getOption())
  }

  const renderComponent = () =>
    renderWithAllProviders(
      <SettingsModal
        isShown={true}
        onHide={handleHide}
        formValues={{ chartMode: MULTI_CHART, unitSystem: IMPERIAL }}
        onSubmit={handleSubmit}
      />
    )

  it('submitting changed values', async () => {
    const { getByText, getByLabelText } = renderComponent()

    await selectOption({
      select: getByLabelText('Show data'),
      getOption: () => getByText('On single chart')
    })

    await selectOption({
      select: getByLabelText('Units system'),
      getOption: () => getByText('Metric')
    })

    fireEvent.click(getByText('Save'))

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled())

    expect(handleSubmit.mock.calls[0][0]).toEqual({
      chartMode: SINGLE_CHART,
      unitSystem: METRIC
    })
  })

  it('calls handleHide on cancel', () => {
    const { getByText } = renderComponent()

    fireEvent.click(getByText('Cancel'))

    expect(handleHide).toHaveBeenCalled()
  })
})
