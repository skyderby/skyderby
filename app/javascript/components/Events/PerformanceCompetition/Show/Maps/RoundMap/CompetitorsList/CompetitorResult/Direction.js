import React from 'react'
import PropTypes from 'prop-types'

import CompassIcon from 'icons/compass.svg'

import styles from './styles.module.scss'

const Direction = ({ direction }) => (
  <span className={styles.direction}>
    <CompassIcon />
    &nbsp;
    {direction}°
  </span>
)

Direction.propTypes = {
  direction: PropTypes.number.isRequired
}

export default Direction
