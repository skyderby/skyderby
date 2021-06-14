import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'

const Navbar = ({ place }) => {
  const placeUrl = `/places/${place.id}`

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink exact to={placeUrl}>
          <span>Overview</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink exact to={`${placeUrl}/videos`}>
          <span>Videos</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink exact to={`${placeUrl}/tracks`}>
          <span>Tracks</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Spacer />

      <PageNavbar.Item right>
        <NavLink to={`${placeUrl}/edit`}>
          <span>
            <CogIcon />
            Edit
          </span>
        </NavLink>
      </PageNavbar.Item>
    </PageNavbar>
  )
}

Navbar.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired
}

export default Navbar
