import React from 'react'
import PropTypes from 'prop-types'

import SimpleValue from './SimpleValue'
import Place from './Place'
import Profile from './Profile'
import Suit from './Suit'

const componentByType = {
  placeId: Place,
  profileId: Profile,
  suitId: Suit,
  year: SimpleValue
}

const Token = ({ type, value, onClick, onDelete }) => {
  const TokenComponent = componentByType[type]

  return (
    <TokenComponent type={type} value={value} onClick={onClick} onDelete={onDelete} />
  )
}

Token.propTypes = {
  type: PropTypes.oneOf(['placeId', 'profileId', 'suitId', 'year']).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClick: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
}

export default Token
