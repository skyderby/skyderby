import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import PageNavbar from 'components/PageNavbar'
import MapsIcon from 'icons/compass.svg'

const Navbar = ({ event }) => {
  const eventUrl = `/events/speed_skydiving/${event.id}`

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink exact to={eventUrl}>
          <span>
            <ListIcon />
            Scoreboard
          </span>
        </NavLink>
      </PageNavbar.Item>

      {event.useOpenScoreboard && (
        <PageNavbar.Item>
          <NavLink to={`${eventUrl}/open_event`}>
            <span>
              <ListIcon />
              Open Event
            </span>
          </NavLink>
        </PageNavbar.Item>
      )}

      {event.useTeams && (
        <PageNavbar.Item>
          <NavLink to={`${eventUrl}/teams`}>
            <span>
              <ListIcon />
              Teams
            </span>
          </NavLink>
        </PageNavbar.Item>
      )}

      <PageNavbar.Item>
        <NavLink to={`${eventUrl}/maps`}>
          <span>
            <MapsIcon />
            Maps
          </span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Spacer />

      <PageNavbar.Item right>
        <NavLink to={`${eventUrl}/edit`}>
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
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    useTeams: PropTypes.bool.isRequired,
    useOpenScoreboard: PropTypes.bool.isRequired
  }).isRequired
}

export default Navbar
