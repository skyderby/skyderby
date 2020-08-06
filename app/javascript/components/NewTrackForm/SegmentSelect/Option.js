import React from 'react'
import { components } from 'react-select'
import PropTypes from 'prop-types'

const Option = ({
  data: {
    segment: { name, pointsCount, hUp, hDown }
  },
  ...props
}) => (
  <components.Option {...props}>
    <div>{name}</div>
    <div>
      {I18n.t('tracks.choose.pt_cnt')}: {pointsCount}; {I18n.t('tracks.choose.elev')}:{' '}
      {hUp}↑ {hDown}↓ {I18n.t('units.m')}
    </div>
  </components.Option>
)

Option.propTypes = {
  data: PropTypes.shape({
    segment: PropTypes.shape({
      name: PropTypes.string.isRequired,
      pointsCount: PropTypes.number.isRequired,
      hUp: PropTypes.number.isRequired,
      hDown: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
}
export default Option
