import React from 'react'
import { motion } from 'framer-motion'
import cx from 'clsx'

import SuitLabel from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'

import { useManufacturerQuery } from 'api/hooks/manufacturer'
import { useProfileQuery } from 'api/hooks/profiles'
import { useSuitQuery } from 'api/hooks/suits'
import { TrackIndexRecord } from 'api/hooks/tracks'
import styles from './styles.module.scss'

type BaseProps<Props = unknown> = {
  track: TrackIndexRecord
  delayIndex?: number
  compact?: boolean
  active?: boolean
  as?: string | React.ComponentType<Props>
}

type ItemProps<
  Element = HTMLAnchorElement,
  Props = unknown
> = React.HTMLAttributes<Element> & Props & BaseProps<Props>

function Item<Element = HTMLDivElement, Props = unknown>({
  track,
  delayIndex = 0,
  compact = false,
  active = false,
  as: Component = 'div',
  ...props
}: ItemProps<Element, Props>): JSX.Element {
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

  const MotionComponent = motion<Props>(Component)

  return (
    <MotionComponent
      className={cx(styles.trackLink, compact && styles.compact, active && styles.active)}
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
    </MotionComponent>
  )
}

export default Item
