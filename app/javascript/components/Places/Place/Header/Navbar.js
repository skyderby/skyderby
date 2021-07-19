import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'
import CogIcon from 'icons/cog.svg'

const Navbar = ({ place }) => {
  const placeUrl = `/places/${place.id}`
  const { t } = useI18n()

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink exact to={placeUrl}>
          <span>{t('places.overview')}</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink exact to={`${placeUrl}/videos`}>
          <span>{t('places.videos')}</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Item>
        <NavLink exact to={`${placeUrl}/tracks`}>
          <span>{t('places.tracks')}</span>
        </NavLink>
      </PageNavbar.Item>

      <PageNavbar.Spacer />

      <PageNavbar.Item right>
        <NavLink to={`${placeUrl}/edit`}>
          <span>
            <CogIcon />
            {t('places.edit')}
          </span>
        </NavLink>
      </PageNavbar.Item>
    </PageNavbar>
  )
}

Navbar.propTypes = {
  place: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired
}

export default Navbar
