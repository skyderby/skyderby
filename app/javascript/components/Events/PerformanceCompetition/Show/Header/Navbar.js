import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import MapsIcon from 'icons/compass.svg'

const Navbar = ({ event }) => {
  const eventUrl = `/events/performance/${event.id}`
  const { t } = useI18n()

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

      <PageNavbar.Item>
        <NavLink to={`${eventUrl}/maps`}>
          <span>
            <MapsIcon />
            Maps
          </span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink to={`${eventUrl}/reference_points`}>
          <span>Reference points</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Spacer />

      <PageNavbar.Item right>
        <NavLink to={`${eventUrl}/edit`}>
          <span>
            <CogIcon />
            {t('general.edit')}
          </span>
        </NavLink>
      </PageNavbar.Item>
    </PageNavbar>
  )
}

Navbar.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired
}

export default Navbar
