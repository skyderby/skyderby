import React from 'react'
import { NavLink } from 'react-router-dom'

import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'
import type { PlaceRecord } from 'api/places'

type NavbarProps = {
  place: PlaceRecord
}

const Navbar = ({ place }: NavbarProps): JSX.Element => {
  const placeUrl = `/places/${place.id}`

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink end to={placeUrl}>
          <span>Overview</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink to={`${placeUrl}/videos`}>
          <span>Videos</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink to={`${placeUrl}/tracks`}>
          <span>Tracks</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Spacer />

      {place.permissions.canEdit && (
        <PageNavbar.Item right>
          <NavLink to={`${placeUrl}/edit`}>
            <span>
              <CogIcon />
              Edit
            </span>
          </NavLink>
        </PageNavbar.Item>
      )}
    </PageNavbar>
  )
}

export default Navbar
