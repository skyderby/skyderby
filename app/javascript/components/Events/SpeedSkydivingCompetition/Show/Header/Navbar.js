import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'

const Navbar = ({ event }) => {
  const { t } = useI18n()
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

      {event.permissions.canEdit && (
        <>
          <PageNavbar.Spacer />

          <PageNavbar.Item right>
            <NavLink to={`${eventUrl}/edit`}>
              <span>
                <CogIcon />
                {t('general.edit')}
              </span>
            </NavLink>
          </PageNavbar.Item>
        </>
      )}
    </PageNavbar>
  )
}

Navbar.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    useTeams: PropTypes.bool.isRequired,
    useOpenScoreboard: PropTypes.bool.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  }).isRequired
}

export default Navbar
