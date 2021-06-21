import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import { useTrackWindDataQuery } from 'api/hooks/tracks/windData'
import ChartIcon from 'icons/chart-bar.svg'
import VideoIcon from 'icons/play-circle.svg'
import MapsIcon from 'icons/compass.svg'
import ListIcon from 'icons/list-ul.svg'
import WindIcon from 'icons/wind-direction.svg'
import CogIcon from 'icons/cog.svg'
import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'

const Navbar = ({ track }) => {
  const { t } = useI18n()
  const {
    id: trackId,
    hasVideo,
    permissions: { canEdit }
  } = track
  const { data: windData = [] } = useTrackWindDataQuery()

  const withLocationState = pathname => location => ({ pathname, state: location.state })

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink exact to={withLocationState(`/tracks/${trackId}`)}>
          <span>
            <ChartIcon />
            {t('tracks.show.charts')}
          </span>
        </NavLink>
      </PageNavbar.Item>

      {hasVideo ? (
        <PageNavbar.Item>
          <NavLink to={withLocationState(`/tracks/${trackId}/video`)}>
            <span>
              <VideoIcon />
              {t('tracks.show.video')}
            </span>
          </NavLink>
        </PageNavbar.Item>
      ) : (
        canEdit && (
          <PageNavbar.Item>
            <NavLink to={withLocationState(`/tracks/${trackId}/video/edit`)}>
              <span>
                <VideoIcon />
                {t('tracks.show.video')}
              </span>
            </NavLink>
          </PageNavbar.Item>
        )
      )}

      <PageNavbar.Item>
        <NavLink to={withLocationState(`/tracks/${trackId}/map`)}>
          <span>
            <MapsIcon />
            Google maps
          </span>
        </NavLink>
      </PageNavbar.Item>
      <PageNavbar.Item>
        <NavLink to={withLocationState(`/tracks/${trackId}/globe`)}>
          <span>
            <MapsIcon />
            3D maps
          </span>
        </NavLink>
      </PageNavbar.Item>
      <PageNavbar.Item>
        <NavLink to={withLocationState(`/tracks/${trackId}/results`)}>
          <span>
            <ListIcon />
            {t('tracks.show.results')}
          </span>
        </NavLink>
      </PageNavbar.Item>
      {windData.length > 0 && (
        <PageNavbar.Item>
          <NavLink to={withLocationState(`/tracks/${trackId}/wind_data`)}>
            <span>
              <WindIcon />
              {t('events.show.weather_data')}
            </span>
          </NavLink>
        </PageNavbar.Item>
      )}

      <PageNavbar.Spacer />

      {track.permissions.canEdit && (
        <PageNavbar.Item right>
          <NavLink to={withLocationState(`/tracks/${track.id}/edit`)}>
            <span>
              <CogIcon />
              Edit
            </span>
          </NavLink>
        </PageNavbar.Item>
      )}
    </PageNavbar>
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
