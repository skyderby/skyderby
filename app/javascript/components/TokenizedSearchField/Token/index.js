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

const Token = props => {
  const { type } = props

  const TokenComponent = componentByType[type]

  return <TokenComponent {...props} />
}

Token.propTypes = {
  type: PropTypes.oneOf(['placeId', 'profileId', 'suitId', 'year']).isRequired
}

export default Token
