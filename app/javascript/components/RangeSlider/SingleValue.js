import React, { forwardRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const SingleValue = forwardRef(({ handle: { value, percent } }, ref) => {
  useLayoutEffect(() => {
    ref.current.style.left = `${percent}%`
  }, [percent, ref])

  return (
    <div className={styles.singleValue} ref={ref}>
      {value.toFixed()}
    </div>
  )
})

SingleValue.propTypes = {
  handle: PropTypes.shape({
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired
}

SingleValue.displayName = 'SingleValue'

export default SingleValue
