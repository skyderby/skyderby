import React from 'react'

import CompassIcon from 'icons/compass.svg'
import styles from './styles.module.scss'

type DirectionProps = {
  direction: number
}

const Direction = ({ direction }: DirectionProps) => (
  <span className={styles.direction}>
    <CompassIcon />
    &nbsp;
    {direction}°
  </span>
)

export default Direction
