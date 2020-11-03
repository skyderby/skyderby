import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'clsx'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'

import styles from './styles.module.scss'

const Item = ({ track, compact = false, as: Component = Link, ...props }) => (
  <Component className={cx(styles.trackLink, compact && styles.compact)} {...props}>
    <div className={styles.id}>{track.id}</div>
    <div className={styles.pilot}>{track.pilotName}</div>
    <div className={styles.suit}>
      <SuitLabel name={track.suitName} code={track.manufacturerCode} />
    </div>
    <div className={styles.place}>
      <PlaceLabel name={track.placeName} code={track.countryCode} />
    </div>
    <div className={styles.comment}>{track.comment}</div>
    <div className={styles.result}>{track.distance || '—'}</div>
    <div className={styles.result}>{track.speed || '—'}</div>
    <div className={styles.result}>{track.time ? track.time.toFixed(1) : '—'}</div>
    <div className={styles.timestamp}>{track.recordedAt}</div>
  </Component>
)

Item.propTypes = {
  as: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  compact: PropTypes.bool,
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    pilotName: PropTypes.string.isRequired,
    suitName: PropTypes.string.isRequired,
    manufacturerCode: PropTypes.string,
    placeName: PropTypes.string.isRequired,
    countryCode: PropTypes.string,
    comment: PropTypes.string,
    distance: PropTypes.number,
    speed: PropTypes.number,
    time: PropTypes.number,
    recordedAt: PropTypes.string
  }).isRequired
}

export default Item
