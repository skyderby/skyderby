import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import { OnlineRankingGroup } from 'api/onlineRankings'

type Props = {
  onlineRankingGroup: OnlineRankingGroup
  years: number[]
}

const Navbar = ({ onlineRankingGroup, years }: Props) => {
  const { t } = useI18n()
  const eventUrl = `/online_rankings/groups/${onlineRankingGroup.id}`
  const location = useLocation()

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink end to={{ pathname: `${eventUrl}/overall`, search: location.search }}>
          <span>
            <ListIcon />
            {t('virtual_competitions.navbar.overall')}
          </span>
        </NavLink>
      </PageNavbar.Item>

      {years.map(year => (
        <PageNavbar.Item key={year}>
          <NavLink to={{ pathname: `${eventUrl}/year/${year}`, search: location.search }}>
            <span>{year}</span>
          </NavLink>
        </PageNavbar.Item>
      ))}
      {onlineRankingGroup.permissions.canEdit && (
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
