import React from 'react'
import cx from 'clsx'

import styles from './styles.module.scss'

type PenaltyLabelProps = {
  penalized: boolean
  penaltySize: number
}

const PenaltyLabel = ({ penalized, penaltySize }: PenaltyLabelProps) => {
  if (!penalized) return null

  const majorPenalty = penaltySize > 20

  return (
    <span className={cx(styles.penaltyLabel, majorPenalty && styles.majorPenalty)}>
      -{penaltySize}%
    </span>
  )
}

export default PenaltyLabel
