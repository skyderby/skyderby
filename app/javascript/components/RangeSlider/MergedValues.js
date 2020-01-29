import React, { forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import { MergedValuesContainer } from './elements'

const MergedValues = forwardRef(({ handles, ...props }, ref) => {
  const values = handles.map(el => el.value).filter(value => isFinite(value))
  const percent = handles.reduce((acc, el) => acc + el.percent / handles.length, 0)

  useEffect(() => {
    ref.current.style.left = `${percent}%`
  }, [percent, ref])

  return (
    <MergedValuesContainer ref={ref} {...props}>
      {`${Math.max(...values).toFixed()} – ${Math.min(...values).toFixed()}`}
    </MergedValuesContainer>
  )
})

MergedValues.propTypes = {
  handles: PropTypes.array.isRequired
}

MergedValues.displayName = 'MergedValues'

export default MergedValues
