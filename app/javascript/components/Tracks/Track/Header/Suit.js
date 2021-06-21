import React from 'react'
import PropTypes from 'prop-types'

import SuitLabel from 'components/SuitLabel'
import SuitIcon from 'icons/suit.svg'

import styles from './styles.module.scss'
import { useSuitQuery } from 'api/hooks/suits'
import { useManufacturerQuery } from 'api/hooks/manufacturer'

const Suit = ({ suitId, suitName: userProvidedSuitName }) => {
  const { data: suit } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  const suitName = suitId ? suit?.name : userProvidedSuitName

  return (
    <div className={styles.suit}>
      <SuitIcon />
      <SuitLabel name={suitName} code={make?.code} />
    </div>
  )
}

Suit.propTypes = {
  suitId: PropTypes.number,
  suitName: PropTypes.string
}

export default Suit
