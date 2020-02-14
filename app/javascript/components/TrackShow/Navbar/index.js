import React from 'react'
import { NavLink } from 'react-router-dom'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import ChartIcon from 'icons/chart-bar.svg'
import VideoIcon from 'icons/play-circle.svg'
import MapsIcon from 'icons/compass.svg'
import ListIcon from 'icons/list-ul.svg'
import WindIcon from 'icons/wind-direction.svg'
import { Container, Fade, Menu, MenuItem, Spacer } from './elements'

const Navbar = ({ trackId }) => {
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
        <MenuItem>
          <NavLink to={`/tracks/${trackId}/video`}>
            <VideoIcon />
            {I18n.t('tracks.show.video')}
          </NavLink>
        </MenuItem>
        <MenuItem>
          <NavLink to={`/tracks/${trackId}/maps`}>
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
        <MenuItem>
          <NavLink to={`/tracks/${trackId}/wind_data`}>
            <WindIcon />
            {I18n.t('events.show.weather_data')}
          </NavLink>
        </MenuItem>

        <Spacer>&nbsp;</Spacer>
      </Menu>
    </Container>
  )
}

Navbar.propTypes = {
  trackId: PropTypes.number.isRequired
}

export default Navbar
