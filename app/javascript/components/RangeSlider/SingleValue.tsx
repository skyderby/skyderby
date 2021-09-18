import React, { forwardRef, HTMLAttributes, useLayoutEffect } from 'react'
import { SliderItem } from 'react-compound-slider'

import styles from './styles.module.scss'

type SingleValueProps = Partial<HTMLAttributes<HTMLDivElement>> & {
  handle: SliderItem
}

const SingleValue = forwardRef<HTMLDivElement, SingleValueProps>(
  ({ handle: { value, percent } }, ref) => {
    useLayoutEffect(() => {
      if (!ref || !('current' in ref) || !ref.current) return
      ref.current.style.left = `${percent}%`
    }, [percent, ref])

    return (
      <div className={styles.singleValue} ref={ref}>
        {value.toFixed()}
      </div>
    )
  }
)

SingleValue.displayName = 'SingleValue'

export default SingleValue
