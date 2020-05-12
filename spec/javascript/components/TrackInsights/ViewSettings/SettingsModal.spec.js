import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import I18n from 'i18n-js'

import { createModalRoot } from 'testHelpers/createModalRoot'
import { SINGLE_CHART, MULTI_CHART } from 'redux/userPreferences/chartMode'
import { METRIC, IMPERIAL } from 'redux/userPreferences/unitSystem'
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
    render(
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
      select: getByLabelText(I18n.t('tracks.show.menu_header')),
      getOption: () => getByText(I18n.t('tracks.show.menu_one'))
    })

    await selectOption({
      select: getByLabelText('Units system'),
      getOption: () => getByText(I18n.t('tracks.show.m_units_metric'))
    })

    fireEvent.click(getByText(I18n.t('general.save')))

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled())

    expect(handleSubmit.mock.calls[0][0]).toEqual({
      chartMode: SINGLE_CHART,
      unitSystem: METRIC
    })
  })

  it('calls handleHide on cancel', () => {
    const { getByText } = renderComponent()

    fireEvent.click(getByText(I18n.t('general.cancel')))

    expect(handleHide).toHaveBeenCalled()
  })
})
