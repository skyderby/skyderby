import React from 'react'
import { Link, LinkProps as ReactRouterLinkProps } from 'react-router-dom'
import { motion, MotionProps } from 'framer-motion'
import cx from 'clsx'

import { SuitName } from 'components/SuitLabel'
import PlaceLabel from 'components/PlaceLabel'
import ProfileName from 'components/ProfileName'
import { useManufacturerQuery } from 'api/manufacturer'
import { useSuitQuery } from 'api/suits'
import { TrackIndexRecord } from 'api/tracks'
import styles from './styles.module.scss'

type DetailsProps = {
  track: TrackIndexRecord
}

const ItemDetails = ({ track }: DetailsProps): JSX.Element => {
  const { data: suit } = useSuitQuery(track.suitId, { enabled: false })
  const { data: manufacturer } = useManufacturerQuery(suit?.makeId, { enabled: false })

  const suitName = suit?.name ?? track.missingSuitName

  return (
    <>
      <div className={styles.id}>{track.id}</div>
      <div className={styles.pilot}>
        {track.profileId ? <ProfileName id={track.profileId} /> : track.pilotName}
      </div>
      <div className={styles.suit}>
        <SuitName name={suitName} code={manufacturer?.code} />
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
      <div className={styles.timestamp}>{track.recordedAt.toLocaleDateString()}</div>
    </>
  )
}

const classNames = (active: boolean, compact: boolean): string =>
  cx(styles.trackLink, compact && styles.compact, active && styles.active)

type BaseProps = {
  track: TrackIndexRecord
  delayIndex?: number
  compact?: boolean
  active?: boolean
}

type LinkProps = BaseProps &
  React.HTMLAttributes<HTMLAnchorElement> &
  ReactRouterLinkProps &
  MotionProps

const ItemLink = ({
  track,
  delayIndex = 0,
  compact = false,
  active = false,
  ...props
}: LinkProps): JSX.Element => {
  const MotionLink = motion(Link)

  const animationVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4, delay: 0.02 * delayIndex } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
  }

  return (
    <MotionLink
      className={classNames(active, compact)}
      variants={animationVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      {...props}
    >
      <ItemDetails track={track} />
    </MotionLink>
  )
}

type ButtonProps = BaseProps & React.HTMLAttributes<HTMLButtonElement> & MotionProps

const ItemButton = ({
  track,
  delayIndex = 0,
  compact = false,
  active = false,
  ...props
}: ButtonProps): JSX.Element => {
  const animationVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4, delay: 0.02 * delayIndex } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
  }

  return (
    <motion.button
      className={classNames(active, compact)}
      variants={animationVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      title={`Toggle track #${track.id}`}
      {...props}
    >
      <ItemDetails track={track} />
    </motion.button>
  )
}

export default { Link: ItemLink, Button: ItemButton }
