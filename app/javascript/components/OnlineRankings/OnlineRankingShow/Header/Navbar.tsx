import React from 'react'
import { NavLink } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import { OnlineRanking } from 'api/onlineRankings'

type Props = {
  onlineRanking: OnlineRanking
}

const Navbar = ({ onlineRanking }: Props) => {
  const { t } = useI18n()
  const eventUrl = `/online_rankings/${onlineRanking.id}`

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink to={`${eventUrl}/overall`}>
          <span>
            <ListIcon />
            {t('virtual_competitions.navbar.overall')}
          </span>
        </NavLink>
      </PageNavbar.Item>

      {onlineRanking.intervalType === 'annual'
        ? onlineRanking.years.map(year => (
            <PageNavbar.Item key={year}>
              <NavLink to={`${eventUrl}/year/${year}`}>
                <span>{year}</span>
              </NavLink>
            </PageNavbar.Item>
          ))
        : onlineRanking.intervals.map(interval => (
            <PageNavbar.Item key={interval.slug}>
              <NavLink to={`${eventUrl}/periods/${interval.slug}`}>
                <span>{interval.name}</span>
              </NavLink>
            </PageNavbar.Item>
          ))}

      {onlineRanking.permissions.canEdit && (
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
