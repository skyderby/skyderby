import React from 'react'
import { useSelector } from 'react-redux'

import { selectAllManufacturers } from 'redux/manufacturers'
import { selectAllSuits } from 'redux/suits'

import MenuItem from './MenuItem'
import { Menu, Separator } from './elements'

const Sidebar = () => {
  const allManufacturers = useSelector(selectAllManufacturers)
  const allSuits = useSelector(selectAllSuits)

  const productsCountByMake = allSuits.reduce((acc, suit) => {
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
    <Menu>
      <MenuItem exact to="/suits" title="Overview" />

      <Separator />

      {activeManufacturers.map(el => (
        <MenuItem
          key={el.id}
          to={`/suits/make/${el.id}`}
          title={el.name}
          subtitle={`Products: ${productsCountByMake[el.id]}`}
        />
      ))}

      <Separator />

      {inactiveManufacturers.map(el => (
        <MenuItem
          key={el.id}
          to={`/suits/make/${el.id}`}
          title={el.name}
          subtitle={`Products: ${productsCountByMake[el.id]}`}
        />
      ))}
    </Menu>
  )
}

export default Sidebar
