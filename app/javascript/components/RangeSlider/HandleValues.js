import React, { createRef, useLayoutEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

import SingleValue from './SingleValue'
import MergedValues from './MergedValues'
import { haveIntersection } from './utils'

const HandleValues = ({ handles }) => {
  const handleRefs = handles.map(() => createRef())
  const mergedValuesRef = createRef()

  const setIndividualHandlesOpacity = useCallback(
    value =>
      handleRefs.forEach(ref => {
        if (!ref.current) return

        ref.current.style.opacity = value
      }),
    [handleRefs]
  )

  useLayoutEffect(() => {
    const [first, second] = handleRefs.map(ref => ref.current)
    const mergedElement = mergedValuesRef.current

    if (haveIntersection(first, second)) {
      setIndividualHandlesOpacity(0)
      mergedElement.style.opacity = 1
    } else {
      setIndividualHandlesOpacity(1)
      mergedElement.style.opacity = 0
    }
  }, [handles, handleRefs, mergedValuesRef, setIndividualHandlesOpacity])

  return (
    <>
      {handles.map((handle, idx) => {
        if (!isFinite(handle.value)) return null

        return (
          <SingleValue
            key={handle.id}
            ref={handleRefs[idx]}
            handle={handle}
            style={{ opacity: 0 }}
          />
        )
      })}

      <MergedValues handles={handles} ref={mergedValuesRef} style={{ opacity: 0 }} />
    </>
  )
}

HandleValues.propTypes = {
  handles: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.number
    })
  ).isRequired
}

export default HandleValues
