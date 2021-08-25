import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import cx from 'clsx'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'

import styles from './styles.module.scss'
import { useManufacturerQuery } from 'api/hooks/manufacturer'
import { useProfileQuery } from 'api/hooks/profiles'
import { useSuitQuery } from 'api/hooks/suits'

const DefaultComponent = props => <Link component={motion.a} {...props} />

const Item = ({
  track,
  delayIndex,
  compact = false,
  as: Component = DefaultComponent,
  ...props
}) => {
  const { data: suit } = useSuitQuery(track.suitId)
  const { data: manufacturer } = useManufacturerQuery(suit?.makeId)
  const { data: profile } = useProfileQuery(track.profileId)

  const suitName = suit?.name ?? track.suitName
  const name = profile?.name ?? track.pilotName

  const animationVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4, delay: 0.02 * delayIndex } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
  }

  return (
    <Component
      className={cx(styles.trackLink, compact && styles.compact)}
      variants={animationVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      {...props}
    >
      <div className={styles.id}>{track.id}</div>
      <div className={styles.pilot}>{name}</div>
      <div className={styles.suit}>
        <SuitLabel name={suitName} code={manufacturer?.code} />
      </div>
      <div className={styles.place}>
        <PlaceLabel placeId={track.placeId} fallbackName={track.placeName} />
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
  delayIndex: PropTypes.number,
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    placeId: PropTypes.number,
    suitId: PropTypes.number,
    profileId: PropTypes.number,
    pilotName: PropTypes.string,
    suitName: PropTypes.string,
    placeName: PropTypes.string,
    comment: PropTypes.string,
    distance: PropTypes.number,
    speed: PropTypes.number,
    time: PropTypes.number,
    recordedAt: PropTypes.string
  }).isRequired
}

export default Item
