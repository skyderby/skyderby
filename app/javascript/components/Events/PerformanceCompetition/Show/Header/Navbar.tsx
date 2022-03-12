import React from 'react'
import { NavLink } from 'react-router-dom'

import { PerformanceCompetition } from 'api/performanceCompetitions'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import MapsIcon from 'icons/compass.svg'

type NavbarProps = {
  event: PerformanceCompetition
}

const Navbar = ({ event }: NavbarProps) => {
  const eventUrl = `/events/performance/${event.id}`
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

export default Navbar
