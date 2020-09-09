import React from 'react'
import PropTypes from 'prop-types'

import { Title, Subtitle, Link, List, SuitName, UsageStat } from './elements'

const suitCategories = [
  { category: 'wingsuit', label: 'Wingsuits' },
  { category: 'monotrack', label: 'One-piece tracksuits' },
  { category: 'tracksuit', label: 'Tracksuits' },
  { category: 'slick', label: 'Slick suits' }
]

const MakeSuits = ({ manufacturer, suits, stats }) => {
  return (
    <div>
      <Title>{manufacturer.name}</Title>

      {suitCategories.map(({ category, label }) => {
        const suitsInCategory = suits.filter(el => el.category === category)

        if (suitsInCategory.length === 0) return null

        return (
          <div key={category}>
            <Subtitle>{label}</Subtitle>
            <List>
              {suitsInCategory.map(el => (
                <li key={el.id}>
                  <Link to={`/suits/${el.id}`}>
                    <SuitName>{el.name}</SuitName>
                    <UsageStat>
                      <div>&nbsp;{stats[el.id]?.profiles}&nbsp;</div>
                      <div>Pilots</div>
                    </UsageStat>
                    <UsageStat>
                      <div>&nbsp;{stats[el.id]?.baseTracks}&nbsp;</div>
                      <div>BASE</div>
                    </UsageStat>
                    <UsageStat>
                      <div>&nbsp;{stats[el.id]?.skydiveTracks}&nbsp;</div>
                      <div>Skydive</div>
                    </UsageStat>
                  </Link>
                </li>
              ))}
            </List>
          </div>
        )
      })}
    </div>
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
