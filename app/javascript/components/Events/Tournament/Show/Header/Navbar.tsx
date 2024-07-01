import React from 'react'
import { NavLink } from 'react-router-dom'

import { Tournament } from 'api/tournaments'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'

type Props = {
  event: Tournament
}

const Navbar = ({ event }: Props) => {
  const eventUrl = `/events/tournament/${event.id}`
  const { t } = useI18n()

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

      <PageNavbar.Item>
        <NavLink end to={`${eventUrl}/qualifications`}>
          <span>
            <ListIcon />
            Qualifications
          </span>
        </NavLink>
      </PageNavbar.Item>

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
