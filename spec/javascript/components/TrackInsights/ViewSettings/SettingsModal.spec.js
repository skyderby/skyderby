import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react'
import renderWithAllProviders from 'testHelpers/renderWithAllProviders'

import createModalRoot from 'testHelpers/createModalRoot'
import TrackViewPreferencesProvider, {
  METRIC,
  IMPERIAL,
  SINGLE_CHART,
  SEPARATE_CHARTS
} from 'components/TrackViewPreferences'
import SettingsModal from 'components/Tracks/Track/TrackInsights/ViewSettings/SettingsModal'

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
      <TrackViewPreferencesProvider>
        <SettingsModal
          isShown={true}
          onHide={handleHide}
          formValues={{ chartMode: SEPARATE_CHARTS, unitSystem: IMPERIAL }}
          onSubmit={handleSubmit}
        />
      </TrackViewPreferencesProvider>
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
