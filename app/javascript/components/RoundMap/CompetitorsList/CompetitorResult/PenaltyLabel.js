import React from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const PenaltyLabel = ({ penalized, penaltySize }) => {
  if (!penalized) return null

  const majorPenalty = penaltySize > 20

  return (
    <span className={cx(styles.penaltyLabel, majorPenalty && styles.majorPenalty)}>
      -{penaltySize}%
    </span>
  )
}

PenaltyLabel.propTypes = {
  penalized: PropTypes.bool,
  penaltySize: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default PenaltyLabel
