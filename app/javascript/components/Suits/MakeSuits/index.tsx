import React from 'react'
import { useParams } from 'react-router-dom'

import { useManufacturerQuery } from 'api/manufacturer'
import { useAllSuitsQuery } from 'api/suits'
import IndexLayout from 'components/Suits/IndexLayout'
import styles from './styles.module.scss'
import SuitsCategory from 'components/Suits/MakeSuits/SuitsCategory'

const suitCategories = [
  { category: 'wingsuit', label: 'Wingsuits' },
  { category: 'monotrack', label: 'One-piece tracksuits' },
  { category: 'tracksuit', label: 'Tracksuits' },
  { category: 'slick', label: 'Slick suits' }
]

const MakeSuits = (): JSX.Element => {
  const params = useParams()
  const makeId = Number(params.id)
  const { data: manufacturer } = useManufacturerQuery(makeId)
  const { data: suits = [] } = useAllSuitsQuery({ manufacturerId: makeId })

  return (
    <IndexLayout>
      <div>
        <h2 className={styles.title}>{manufacturer?.name}</h2>

        {suitCategories.map(({ category, label }) => (
          <SuitsCategory
            key={category}
            suits={suits.filter(el => el.category === category)}
            category={label}
          />
        ))}
      </div>
    </IndexLayout>
  )
}

export default MakeSuits
