import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { createSuitSelector } from 'redux/suits'
import { createManufacturerSelector } from 'redux/manufacturers'
import Breadcrumbs from 'components/ui/Breadcrumbs'

const SuitEdit = ({ suitId }) => {
  const suit = useSelector(createSuitSelector(suitId))
  const make = useSelector(createManufacturerSelector(suit?.makeId))

  return (
    <div>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link to="/suits">Suits</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Link to={`/suits/make/${make.id}`}>{make.name}</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{suit.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      <h1>Edit</h1>
    </div>
  )
}

SuitEdit.propTypes = {
  suitId: PropTypes.number.isRequired
}

export default SuitEdit
