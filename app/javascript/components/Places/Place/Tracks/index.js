import React from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import { useI18n } from 'components/TranslationsProvider'

const TracksList = ({ match }) => {
  const placeId = Number(match.params.id)
  const { t } = useI18n()

  return (
    <div>
      <Helmet>
        <title>{`${t('places.title')} | ${t('places.tracks')}`}</title>
        <meta name="description" content={t('places.description')} />
      </Helmet>
      <div>Tracks {placeId}</div>
    </div>
  )
}

TracksList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default TracksList
