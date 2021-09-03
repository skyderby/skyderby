import React from 'react'
import PropTypes from 'prop-types'

import { ValueKey } from 'components/TokenizedSearchField/types'
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

type TokenProps = {
  type: ValueKey
}

const Token = ({ type, ...props }: TokenProps): JSX.Element => {
  const TokenComponent = componentByType[type]

  return <TokenComponent {...props} />
}

Token.propTypes = {
  type: PropTypes.oneOf(['placeId', 'profileId', 'suitId', 'year']).isRequired
}

export default Token
