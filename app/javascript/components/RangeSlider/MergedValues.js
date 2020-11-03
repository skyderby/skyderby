import React, { forwardRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const MergedValues = forwardRef(({ handles, ...props }, ref) => {
  const values = handles.map(el => el.value).filter(value => isFinite(value))
  const percent = handles.reduce((acc, el) => acc + el.percent / handles.length, 0)

  useLayoutEffect(() => {
    ref.current.style.left = `${percent}%`
  }, [percent, ref])

  return (
    <div className={styles.mergedValues} ref={ref} {...props}>
      {`${Math.max(...values).toFixed()} – ${Math.min(...values).toFixed()}`}
    </div>
  )
})

MergedValues.propTypes = {
  handles: PropTypes.array.isRequired
}

MergedValues.displayName = 'MergedValues'

export default MergedValues
