import React, { forwardRef, HTMLAttributes, useLayoutEffect } from 'react'
import { SliderItem } from 'react-compound-slider'

import styles from './styles.module.scss'

type MergedValuesProps = Partial<HTMLAttributes<HTMLDivElement>> & {
  handles: SliderItem[]
}

const MergedValues = forwardRef<HTMLDivElement, MergedValuesProps>(
  ({ handles, ...props }, ref) => {
    const values = handles.map(el => el.value).filter(value => isFinite(value))
    const percent = handles.reduce((acc, el) => acc + el.percent / handles.length, 0)

    useLayoutEffect(() => {
      if (!ref || !('current' in ref) || !ref.current) return
      ref.current.style.left = `${percent}%`
    }, [percent, ref])

    return (
      <div className={styles.mergedValues} ref={ref} {...props}>
        {`${Math.min(...values).toFixed()} - ${Math.max(...values).toFixed()}`}
      </div>
    )
  }
)

MergedValues.displayName = 'MergedValues'

export default MergedValues
