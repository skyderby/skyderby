import React from 'react'
import { NavLink } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import type { SpeedSkydivingCompetition } from 'api/speedSkydivingCompetitions'

type NavbarProps = {
  event: SpeedSkydivingCompetition
}

const Navbar = ({ event }: NavbarProps): JSX.Element => {
  const { t } = useI18n()
  const eventUrl = `/events/speed_skydiving/${event.id}`

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink end to={eventUrl}>
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

      {event.permissions.canDownload && (
        <PageNavbar.Item>
          <NavLink to={`${eventUrl}/downloads`}>
            <span>Downloads</span>
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

export default Navbar
