import React from 'react'
import PropTypes from 'prop-types'

import useVideosQuery from 'api/hooks/videos'
import Card from './Card'
import styles from './styles.module.scss'

const Videos = ({ match }) => {
  const placeId = Number(match.params.id)
  const { data } = useVideosQuery({ placeId })

  const items = data?.items ?? []

  return (
    <div className={styles.container}>
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
