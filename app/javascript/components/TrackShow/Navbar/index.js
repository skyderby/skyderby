import React, { useLayoutEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import cx from 'clsx'
import PropTypes from 'prop-types'

import { useTrackWindDataQuery } from 'api/hooks/tracks/windData'
import ChartIcon from 'icons/chart-bar.svg'
import VideoIcon from 'icons/play-circle.svg'
import MapsIcon from 'icons/compass.svg'
import ListIcon from 'icons/list-ul.svg'
import WindIcon from 'icons/wind-direction.svg'
import CogIcon from 'icons/cog.svg'
import { useI18n } from 'components/TranslationsProvider'
import styles from './styles.module.scss'

const Navbar = ({ track }) => {
  const { t } = useI18n()
  const {
    id: trackId,
    hasVideo,
    permissions: { canEdit }
  } = track
  const { data: windData = [] } = useTrackWindDataQuery()
  const menuRef = useRef()
  const fadeRef = useRef()

  useLayoutEffect(() => {
    const menuElement = menuRef.current
    const fadeElement = fadeRef.current

    const handleScroll = () => {
      const scrollable =
        menuElement.scrollLeft + menuElement.clientWidth + 18 < menuElement.scrollWidth
      fadeElement.style.visibility = scrollable ? 'visible' : 'hidden'
      fadeElement.style.opacity = scrollable ? 1 : 0
    }

    handleScroll()
    menuElement.addEventListener('scroll', handleScroll)

    return () => menuElement.removeEventListener('scroll', handleScroll)
  }, [])

  const withLocationState = pathname => location => ({ pathname, state: location.state })

  return (
    <div className={styles.container}>
      <div className={styles.fade} ref={fadeRef} />
      <ul className={styles.menu} ref={menuRef}>
        <li className={styles.menuItem}>
          <NavLink exact to={withLocationState(`/tracks/${trackId}`)}>
            <span>
              <ChartIcon />
              {t('tracks.show.charts')}
            </span>
          </NavLink>
        </li>
        {hasVideo ? (
          <li className={styles.menuItem}>
            <NavLink to={withLocationState(`/tracks/${trackId}/video`)}>
              <span>
                <VideoIcon />
                {t('tracks.show.video')}
              </span>
            </NavLink>
          </li>
        ) : (
          canEdit && (
            <li className={styles.menuItem}>
              <NavLink to={withLocationState(`/tracks/${trackId}/video/edit`)}>
                <span>
                  <VideoIcon />
                  {t('tracks.show.video')}
                </span>
              </NavLink>
            </li>
          )
        )}
        <li className={styles.menuItem}>
          <NavLink to={withLocationState(`/tracks/${trackId}/map`)}>
            <span>
              <MapsIcon />
              Google maps
            </span>
          </NavLink>
        </li>
        <li className={styles.menuItem}>
          <NavLink to={withLocationState(`/tracks/${trackId}/globe`)}>
            <span>
              <MapsIcon />
              3D maps
            </span>
          </NavLink>
        </li>
        <li className={styles.menuItem}>
          <NavLink to={withLocationState(`/tracks/${trackId}/results`)}>
            <span>
              <ListIcon />
              {t('tracks.show.results')}
            </span>
          </NavLink>
        </li>
        {windData.length > 0 && (
          <li className={styles.menuItem}>
            <NavLink to={withLocationState(`/tracks/${trackId}/wind_data`)}>
              <span>
                <WindIcon />
                {t('events.show.weather_data')}
              </span>
            </NavLink>
          </li>
        )}

        <li className={styles.spacer}>&nbsp;</li>

        {track.permissions.canEdit && (
          <li className={cx(styles.menuItem, styles.right)}>
            <NavLink to={withLocationState(`/tracks/${track.id}/edit`)}>
              <span>
                <CogIcon />
                Edit
              </span>
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  )
}

Navbar.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    hasVideo: PropTypes.bool.isRequired,
    permissions: PropTypes.shape({
      canEdit: PropTypes.bool.isRequired
    }).isRequired
  })
}

export default Navbar
