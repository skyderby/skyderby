import React from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import useVideosQuery from 'api/hooks/videos'
import Card from './Card'
import styles from './styles.module.scss'

const Videos = ({ match }) => {
  const placeId = Number(match.params.id)
  const { data } = useVideosQuery({ placeId })

  const items = data?.items ?? []
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{`${t('places.title')} | ${t('places.videos')}`}</title>
        <meta name="description" content={t('places.description')} />
      </Helmet>
      {items.map(video => (
        <Card key={video.trackId} video={video} />
      ))}
    </div>
  )
}

Videos.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Videos
