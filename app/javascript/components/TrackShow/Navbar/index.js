import React from 'react'
import { NavLink } from 'react-router-dom'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

import ChartIcon from 'icons/chart-bar.svg'
import VideoIcon from 'icons/play-circle.svg'
import MapsIcon from 'icons/compass.svg'
import ListIcon from 'icons/list-ul.svg'
import WindIcon from 'icons/wind-direction.svg'
import { selectWindData } from 'redux/tracks/windData'
import { Container, Fade, Menu, MenuItem, Spacer } from './elements'

const Navbar = ({ track }) => {
  const { id: trackId, hasVideo, editable } = track
  const windData = useSelector(state => selectWindData(state, trackId))

  return (
    <Container>
      <Fade />
      <Menu>
        <MenuItem>
          <NavLink exact to={`/tracks/${trackId}`}>
            <ChartIcon />
            {I18n.t('tracks.show.charts')}
          </NavLink>
        </MenuItem>
        {(hasVideo || editable) && (
          <MenuItem>
            <NavLink to={`/tracks/${trackId}/video`}>
              <VideoIcon />
              {I18n.t('tracks.show.video')}
            </NavLink>
          </MenuItem>
        )}
        <MenuItem>
          <NavLink to={`/tracks/${trackId}/map`}>
            <MapsIcon />
            Google maps
          </NavLink>
        </MenuItem>
        <MenuItem>
          <NavLink to={`/tracks/${trackId}/globe`}>
            <MapsIcon />
            3D maps
          </NavLink>
        </MenuItem>
        <MenuItem>
          <NavLink to={`/tracks/${trackId}/results`}>
            <ListIcon />
            {I18n.t('tracks.show.results')}
          </NavLink>
        </MenuItem>
        {windData.length > 0 && (
          <MenuItem>
            <NavLink to={`/tracks/${trackId}/wind_data`}>
              <WindIcon />
              {I18n.t('events.show.weather_data')}
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
