import React from 'react'

import { SuitName } from 'components/SuitLabel'
import SuitIcon from 'icons/suit.svg'

import styles from './styles.module.scss'
import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'

type SuitProps = {
  suitId?: number | null
  suitName?: string | null
}

const Suit = ({ suitId, suitName: userProvidedSuitName }: SuitProps): JSX.Element => {
  const { data: suit } = useSuitQuery(suitId, { enabled: false })
  const { data: make } = useManufacturerQuery(suit?.makeId, { enabled: false })

  const suitName = suitId ? suit?.name : userProvidedSuitName

  return (
    <div className={styles.suit}>
      <SuitIcon />
      <SuitName name={suitName} code={make?.code} />
    </div>
  )
}

export default Suit
