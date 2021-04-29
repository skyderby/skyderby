import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'clsx'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'

import styles from './styles.module.scss'
import { usePlaceQuery } from 'api/hooks/places'
import { useCountryQuery } from 'api/hooks/countries'
import { useManufacturerQuery } from 'api/hooks/manufacturer'
import { useProfileQuery } from 'api/hooks/profiles'
import { useSuitQuery } from 'api/hooks/suits'

const Item = ({ track, compact = false, as: Component = Link, ...props }) => {
  const { data: place } = usePlaceQuery(track.placeId)
  const { data: country } = useCountryQuery(place?.countryId)
  const { data: suit } = useSuitQuery(track.suitId)
  const { data: manufacturer } = useManufacturerQuery(suit?.makeId)
  const { data: profile } = useProfileQuery(track.profileId)

  const suitName = suit?.name ?? track.suitName
  const placeName = place?.name ?? track.placeName
  const name = profile?.name ?? track.pilotName

  return (
    <Component className={cx(styles.trackLink, compact && styles.compact)} {...props}>
      <div className={styles.id}>{track.id}</div>
      <div className={styles.pilot}>{name}</div>
      <div className={styles.suit}>
        <SuitLabel name={suitName} code={manufacturer?.code} />
      </div>
      <div className={styles.place}>
        <PlaceLabel name={placeName} code={country?.code} />
      </div>
      <div className={styles.comment}>{track.comment}</div>
      <div className={styles.result}>{track.distance || '—'}</div>
      <div className={styles.result}>{track.speed || '—'}</div>
      <div className={styles.result}>{track.time ? track.time.toFixed(1) : '—'}</div>
      <div className={styles.timestamp}>{track.recordedAt}</div>
    </Component>
  )
}

Item.propTypes = {
  as: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  compact: PropTypes.bool,
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    placeId: PropTypes.number.isRequired,
    suitId: PropTypes.number.isRequired,
    profileId: PropTypes.number.isRequired,
    pilotName: PropTypes.string.isRequired,
    suitName: PropTypes.string.isRequired,
    placeName: PropTypes.string.isRequired,
    comment: PropTypes.string,
    distance: PropTypes.number,
    speed: PropTypes.number,
    time: PropTypes.number,
    recordedAt: PropTypes.string
  }).isRequired
}

export default Item
