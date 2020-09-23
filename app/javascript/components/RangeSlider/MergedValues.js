import React, { forwardRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'

const MergedValues = forwardRef(({ handles, ...props }, ref) => {
  const values = handles.map(el => el.value).filter(value => isFinite(value))
  const percent = handles.reduce((acc, el) => acc + el.percent / handles.length, 0)

  useLayoutEffect(() => {
    ref.current.style.left = `${percent}%`
  }, [percent, ref])

  return (
    <div className="range-slider-merged-values" ref={ref} {...props}>
      {`${Math.max(...values).toFixed()} – ${Math.min(...values).toFixed()}`}
    </div>
  )
})

MergedValues.propTypes = {
  handles: PropTypes.array.isRequired
}

MergedValues.displayName = 'MergedValues'

export default MergedValues
