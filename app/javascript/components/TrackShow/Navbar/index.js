import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import ChartIcon from 'icons/chart-bar.svg'
import VideoIcon from 'icons/play-circle.svg'
import MapsIcon from 'icons/compass.svg'
import ListIcon from 'icons/list-ul.svg'
import WindIcon from 'icons/wind-direction.svg'
import { useI18n } from 'components/TranslationsProvider'
import { selectWindData } from 'redux/tracks/windData'
import { Container, Fade, Menu, MenuItem, Spacer } from './elements'

const Navbar = ({ track }) => {
  const { t } = useI18n()
  const { id: trackId, hasVideo, editable } = track
  const windData = useSelector(state => selectWindData(state, trackId))

  const buildLink = pathname => location => ({ pathname, state: location.state })

  return (
    <Container>
      <Fade />
      <Menu>
        <MenuItem>
          <NavLink exact to={buildLink(`/tracks/${trackId}`)}>
            <ChartIcon />
            {t('tracks.show.charts')}
          </NavLink>
        </MenuItem>
        {hasVideo ? (
          <MenuItem>
            <NavLink to={buildLink(`/tracks/${trackId}/video`)}>
              <VideoIcon />
              {t('tracks.show.video')}
            </NavLink>
          </MenuItem>
        ) : (
          editable && (
            <MenuItem>
              <NavLink to={buildLink(`/tracks/${trackId}/video/edit`)}>
                <VideoIcon />
                {t('tracks.show.video')}
              </NavLink>
            </MenuItem>
          )
        )}
        <MenuItem>
          <NavLink to={buildLink(`/tracks/${trackId}/map`)}>
            <MapsIcon />
            Google maps
          </NavLink>
        </MenuItem>
        <MenuItem>
          <NavLink to={buildLink(`/tracks/${trackId}/globe`)}>
            <MapsIcon />
            3D maps
          </NavLink>
        </MenuItem>
        <MenuItem>
          <NavLink to={buildLink(`/tracks/${trackId}/results`)}>
            <ListIcon />
            {t('tracks.show.results')}
          </NavLink>
        </MenuItem>
        {windData.length > 0 && (
          <MenuItem>
            <NavLink to={buildLink(`/tracks/${trackId}/wind_data`)}>
              <WindIcon />
              {t('events.show.weather_data')}
            </NavLink>
          </MenuItem>
        )}

        <Spacer>&nbsp;</Spacer>
      </Menu>
    </Container>
  )
}

Navbar.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number.isRequired,
    hasVideo: PropTypes.bool.isRequired,
    editable: PropTypes.bool.isRequired
  })
}

export default Navbar
