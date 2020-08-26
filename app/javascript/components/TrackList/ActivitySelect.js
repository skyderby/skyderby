import React from 'react'
import PropTypes from 'prop-types'

import { ActivityLink } from './elements'

const ActivitySelect = ({ buildUrl, currentActivity }) => (
  <div>
    <ActivityLink
      to={location => ({ ...location, search: buildUrl({ page: null, activity: null }) })}
      active={!currentActivity}
    >
      All
    </ActivityLink>
    <ActivityLink
      to={location => ({
        ...location,
        search: buildUrl({ page: null, activity: 'skydive' })
      })}
      active={currentActivity === 'skydive'}
    >
      Skydive
    </ActivityLink>
    <ActivityLink
      to={location => ({
        ...location,
        search: buildUrl({ page: null, activity: 'base' })
      })}
      active={currentActivity === 'base'}
    >
      Base
    </ActivityLink>
  </div>
)

ActivitySelect.propTypes = {
  buildUrl: PropTypes.func.isRequired,
  currentActivity: PropTypes.string
}

export default ActivitySelect
