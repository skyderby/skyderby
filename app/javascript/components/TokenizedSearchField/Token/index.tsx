import React from 'react'

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
  value: string | number
  onDelete: (e?: React.MouseEvent) => unknown
}

const Token = (props: TokenProps): JSX.Element => {
  const { type } = props
  const TokenComponent = componentByType[type]

  return <TokenComponent {...props} />
}

export default Token
