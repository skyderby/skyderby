import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const suitCategories = [
  { category: 'wingsuit', label: 'Wingsuits' },
  { category: 'monotrack', label: 'One-piece tracksuits' },
  { category: 'tracksuit', label: 'Tracksuits' },
  { category: 'slick', label: 'Slick suits' }
]

const MakeSuits = ({ manufacturer, suits, stats }) => {
  return (
    <div>
      <h2 className={styles.title}>{manufacturer.name}</h2>

      {suitCategories.map(({ category, label }) => {
        const suitsInCategory = suits.filter(el => el.category === category)

        if (suitsInCategory.length === 0) return null

        return (
          <div key={category}>
            <h3 className={styles.subtitle}>{label}</h3>
            <ul>
              {suitsInCategory.map(el => (
                <li key={el.id}>
                  <Link className={styles.link} to={`/suits/${el.id}`}>
                    <div className={styles.suitName}>{el.name}</div>
                    <div className={styles.usageStat}>
                      <div>&nbsp;{stats[el.id]?.profiles}&nbsp;</div>
                      <div>Pilots</div>
                    </div>
                    <div className={styles.usageStat}>
                      <div>&nbsp;{stats[el.id]?.baseTracks}&nbsp;</div>
                      <div>BASE</div>
                    </div>
                    <div className={styles.usageStat}>
                      <div>&nbsp;{stats[el.id]?.skydiveTracks}&nbsp;</div>
                      <div>Skydive</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
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
