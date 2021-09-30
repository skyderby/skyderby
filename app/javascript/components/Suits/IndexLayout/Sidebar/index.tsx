import React from 'react'

import { useManufacturersQuery } from 'api/hooks/manufacturer'
import { useAllSuitsQuery } from 'api/hooks/suits'
import MenuItem from './MenuItem'
import styles from './styles.module.scss'

const Sidebar = () => {
  const { data: allSuits = [] } = useAllSuitsQuery()
  const { data: allManufacturers = [] } = useManufacturersQuery()

  const productsCountByMake = allSuits.reduce<Record<string, number>>((acc, suit) => {
    acc[suit.makeId] = (acc[suit.makeId] || 0) + 1

    return acc
  }, {})

  const activeManufacturers = allManufacturers
    .filter(el => el.active)
    .sort((a, b) => a.name.localeCompare(b.name))

  const inactiveManufacturers = allManufacturers
    .filter(el => !el.active)
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <ul className={styles.menu}>
      <MenuItem exact to="/suits" title="Overview" />

      <li className={styles.separator} />

      {activeManufacturers.map(el => (
        <MenuItem
          key={el.id}
          to={`/suits/make/${el.id}`}
          title={el.name}
          subtitle={`Products: ${productsCountByMake[el.id]}`}
        />
      ))}

      <li className={styles.separator} />

      {inactiveManufacturers.map(el => (
        <MenuItem
          key={el.id}
          to={`/suits/make/${el.id}`}
          title={el.name}
          subtitle={`Products: ${productsCountByMake[el.id] ?? ''}`}
        />
      ))}
    </ul>
  )
}

export default Sidebar
