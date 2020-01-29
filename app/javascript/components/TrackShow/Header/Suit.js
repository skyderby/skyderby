import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectSuit } from 'redux/suits'
import SuitLabel from 'components/SuitLabel'
import SuitIcon from 'icons/suit.svg'

import { SuitContainer } from './elements'

const Suit = ({ suitId, suitName: userProvidedSuitName }) => {
  const suit = useSelector(state => selectSuit(state, suitId))

  const suitName = suitId ? suit.name : userProvidedSuitName
  const suitCode = suit && suit.makeCode

  return (
    <SuitContainer>
      <SuitIcon />
      <SuitLabel name={suitName} code={suitCode} />
    </SuitContainer>
  )
}

Suit.propTypes = {
  suitId: PropTypes.number,
  suitName: PropTypes.string
}

export default Suit
