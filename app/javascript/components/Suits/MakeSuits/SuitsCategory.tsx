import React from 'react'

import { SuitRecord } from 'api/hooks/suits'
import { useSuitsStats } from 'api/hooks/suitsStats'
import Suit from './Suit'
import styles from './styles.module.scss'

type SuitsCategoryProps = {
  suits: SuitRecord[]
  category: string
}

const SuitsCategory = ({ suits, category }: SuitsCategoryProps): JSX.Element | null => {
  useSuitsStats(suits.map(suit => suit.id))

  if (suits.length === 0) return null

  return (
    <div>
      <h3 className={styles.subtitle}>{category}</h3>
      <ul>
        {suits.map(suit => (
          <li key={suit.id}>
            <Suit suit={suit} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SuitsCategory
