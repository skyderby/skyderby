import React from 'react'
import { match } from 'react-router-dom'
import PropTypes from 'prop-types'

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

type MakeSuitsProps = {
  match: match<{ id: string }>
}

const MakeSuits = ({ match }: MakeSuitsProps): JSX.Element => {
  const makeId = Number(match.params.id)
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

MakeSuits.propTypes = {
  manufacturer: PropTypes.shape({
    name: PropTypes.string.isRequired
  }),
  suits: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      category: PropTypes.oneOf(suitCategories.map(el => el.category)).isRequired
    })
  ),
  stats: PropTypes.objectOf(
    PropTypes.shape({
      profiles: PropTypes.number.isRequired,
      baseTracks: PropTypes.number.isRequired,
      skydiveTracks: PropTypes.number.isRequired
    })
  )
}

export default MakeSuits
