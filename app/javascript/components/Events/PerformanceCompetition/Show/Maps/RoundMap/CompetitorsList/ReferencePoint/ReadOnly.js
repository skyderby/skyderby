import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectReferencePointById } from 'redux/events/round/selectors'
import LocationIcon from 'icons/location.svg'

import styles from './styles.module.scss'

const ReadOnly = ({ referencePointId }) => {
  const referencePoint = useSelector(state =>
    selectReferencePointById(state, referencePointId)
  )

  if (!referencePoint) return null

  return (
    <div className={styles.readOnly}>
      <LocationIcon />
      {referencePoint.name}
    </div>
  )
}

ReadOnly.propTypes = {
  referencePointId: PropTypes.number
}

export default ReadOnly
