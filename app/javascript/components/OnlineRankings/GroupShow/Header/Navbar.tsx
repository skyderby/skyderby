import React from 'react'
import { NavLink } from 'react-router-dom'

import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'
import ListIcon from 'icons/list-ul.svg'
import { OnlineRankingGroup } from 'api/onlineRankings'

type Props = {
  onlineRankingGroup: OnlineRankingGroup
}

const Navbar = ({ onlineRankingGroup }: Props) => {
  const { t } = useI18n()
  const eventUrl = `/online_rankings/groups/${onlineRankingGroup.id}`

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink to={`${eventUrl}`}>
          <span>
            <ListIcon />
            Cumulative scoreboard
          </span>
        </NavLink>
      </PageNavbar.Item>

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
