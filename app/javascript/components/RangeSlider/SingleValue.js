import React, { forwardRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import { SingleValueContainer } from './elements'

const SingleValue = forwardRef(({ handle: { value, percent } }, ref) => {
  useEffect(() => {
    ref.current.style.left = `${percent}%`
  }, [percent, ref])

  return <SingleValueContainer ref={ref}>{value.toFixed()}</SingleValueContainer>
})

SingleValue.propTypes = {
  handle: PropTypes.shape({
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired
}

SingleValue.displayName = 'SingleValue'

export default SingleValue
