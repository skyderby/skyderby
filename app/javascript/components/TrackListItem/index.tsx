import React from 'react'
import { Link } from 'react-router-dom'
import { LocationDescriptor, Location } from 'history'
import { motion, MotionProps } from 'framer-motion'
import cx from 'clsx'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'

import { useManufacturerQuery } from 'api/hooks/manufacturer'
import { useProfileQuery } from 'api/hooks/profiles'
import { useSuitQuery } from 'api/hooks/suits'
import { TrackIndexRecord } from 'api/hooks/tracks'
import styles from './styles.module.scss'

interface LocationState {
  returnTo?: Location | string
}

type ItemProps = {
  track: TrackIndexRecord
  delayIndex?: number
  compact?: boolean
  as?: React.ComponentType<React.HTMLAttributes<HTMLElement> & MotionProps>
  to?:
    | LocationDescriptor<LocationState>
    | ((location: Location<LocationState>) => LocationDescriptor<LocationState>)
}

const Item = ({
  track,
  delayIndex = 0,
  compact = false,
  as: Component = motion(Link),
  ...props
}: ItemProps): JSX.Element => {
  const { data: suit } = useSuitQuery(track.suitId, { enabled: false })
  const { data: manufacturer } = useManufacturerQuery(suit?.makeId, { enabled: false })
  const { data: profile } = useProfileQuery(track.profileId, { enabled: false })

  const suitName = suit?.name ?? track.missingSuitName
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
        <PlaceLabel
          placeId={track.placeId}
          fallbackName={track.location}
          refetchEnabled={false}
        />
      </div>
      <div className={styles.comment}>{track.comment}</div>
      <div className={styles.result}>{track.distance || '—'}</div>
      <div className={styles.result}>{track.speed || '—'}</div>
      <div className={styles.result}>{track.time ? track.time.toFixed(1) : '—'}</div>
      <div className={styles.timestamp}>{track.recordedAt}</div>
    </Component>
  )
}

export default Item
