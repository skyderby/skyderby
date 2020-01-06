import React from 'react'
import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import { ActivityLink } from './elements'

const ActivitySelect = ({ urlBuilder }) => {
  const { kind: currentActivity } = Object.fromEntries(
    new URLSearchParams(useLocation().search)
  )

  return (
    <div>
      <ActivityLink to={urlBuilder({ page: null, kind: null })} active={!currentActivity}>
        All
      </ActivityLink>
      <ActivityLink
        to={urlBuilder({ page: null, kind: 'skydive' })}
        active={currentActivity === 'skydive'}
      >
        Skydive
      </ActivityLink>
      <ActivityLink
        to={urlBuilder({ page: null, kind: 'base' })}
        active={currentActivity === 'base'}
      >
        Base
      </ActivityLink>
    </div>
  )
}

ActivitySelect.propTypes = {
  urlBuilder: PropTypes.func.isRequired
}

export default ActivitySelect
