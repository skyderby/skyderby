import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import {
  selectUserPreferences,
  updatePreferences,
  STRAIGHT_LINE
} from 'redux/userPreferences'
import AppShell from 'components/AppShell'
import FlightProfiles from 'components/FlightProfiles'
import usePageParams from 'components/FlightProfiles/usePageParams'

const FlightProfilesPage = () => {
  const dispatch = useDispatch()
  const {
    params,
    setSelectedTerrainProfile,
    setAdditionalTerrainProfiles,
    deleteAdditionalTerrainProfile,
    toggleTrack
  } = usePageParams()

  const { flightProfileDistanceCalculationMethod } = useSelector(selectUserPreferences)
  const { t } = useI18n()

  const setDistanceCalculationMethod = value => {
    dispatch(updatePreferences({ flightProfileDistanceCalculationMethod: value }))
  }

  return (
    <AppShell fullScreen>
      <Helmet>
        <title>{t('flight_profiles.title')}</title>
        <meta name="description" content={t('flight_profiles.description')} />
      </Helmet>

      <FlightProfiles
        straightLine={flightProfileDistanceCalculationMethod === STRAIGHT_LINE}
        distanceCalculationMethod={flightProfileDistanceCalculationMethod}
        setSelectedTerrainProfile={setSelectedTerrainProfile}
        setDistanceCalculationMethod={setDistanceCalculationMethod}
        setAdditionalTerrainProfiles={setAdditionalTerrainProfiles}
        deleteAdditionalTerrainProfile={deleteAdditionalTerrainProfile}
        toggleTrack={toggleTrack}
        {...params}
      />
    </AppShell>
  )
}

FlightProfilesPage.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string
  }).isRequired
}

export default FlightProfilesPage
