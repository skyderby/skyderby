import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'

import { useTrackWindDataQuery } from 'api/tracks/windData'
import { TrackRecord } from 'api/tracks'
import ChartIcon from 'icons/chart-bar.svg'
import VideoIcon from 'icons/play-circle.svg'
import MapsIcon from 'icons/compass.svg'
import ListIcon from 'icons/list-ul.svg'
import WindIcon from 'icons/wind-direction.svg'
import CogIcon from 'icons/cog.svg'
import { useI18n } from 'components/TranslationsProvider'
import PageNavbar from 'components/PageNavbar'

type NavbarProps = {
  track: TrackRecord
}

const Navbar = ({ track }: NavbarProps): JSX.Element => {
  const { t } = useI18n()
  const location = useLocation()
  const {
    id: trackId,
    hasVideo,
    permissions: { canEdit }
  } = track
  const { data: windData = [] } = useTrackWindDataQuery(trackId)

  return (
    <PageNavbar>
      <PageNavbar.Item>
        <NavLink end to={`/tracks/${trackId}`} state={location.state}>
          <span>
            <ChartIcon />
            {t('tracks.show.charts')}
          </span>
        </NavLink>
      </PageNavbar.Item>

      {hasVideo ? (
        <PageNavbar.Item>
          <NavLink to={`/tracks/${trackId}/video`} state={location.state}>
            <span>
              <VideoIcon />
              {t('tracks.show.video')}
            </span>
          </NavLink>
        </PageNavbar.Item>
      ) : (
        canEdit && (
          <PageNavbar.Item>
            <NavLink to={`/tracks/${trackId}/video/edit`} state={location.state}>
              <span>
                <VideoIcon />
                {t('tracks.show.video')}
              </span>
            </NavLink>
          </PageNavbar.Item>
        )
      )}

      <PageNavbar.Item>
        <NavLink to={`/tracks/${trackId}/map`} state={location.state}>
          <span>
            <MapsIcon />
            Google maps
          </span>
        </NavLink>
      </PageNavbar.Item>
      <PageNavbar.Item>
        <NavLink to={`/tracks/${trackId}/globe`} state={location.state}>
          <span>
            <MapsIcon />
            3D maps
          </span>
        </NavLink>
      </PageNavbar.Item>
      <PageNavbar.Item>
        <NavLink to={`/tracks/${trackId}/results`} state={location.state}>
          <span>
            <ListIcon />
            {t('tracks.show.results')}
          </span>
        </NavLink>
      </PageNavbar.Item>
      {windData.length > 0 && (
        <PageNavbar.Item>
          <NavLink to={`/tracks/${trackId}/wind_data`} state={location.state}>
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
          <NavLink to={`/tracks/${track.id}/edit`} state={location.state}>
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

export default Navbar
