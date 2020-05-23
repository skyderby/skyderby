import React from 'react'
import PropTypes from 'prop-types'

import CogIcon from 'icons/cog.svg'
import Profile from './Profile'
import Suit from './Suit'
import Place from './Place'
import { Container, Row, EditLink } from './elements'

const Header = ({ track }) => (
  <Container>
    <Row>
      <Profile profileId={track.profileId} pilotName={track.name} />
      <EditLink
        to={location => ({
          pathname: `/tracks/${track.id}/edit`,
          state: location.state
        })}
      >
        <CogIcon />
        <span>Edit</span>
      </EditLink>
    </Row>
    <Row>
      <Place placeId={track.placeId} placeName={track.placeName} />
      <Suit suitId={track.suitId} suitName={track.suitName} />
    </Row>
  </Container>
)

Header.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    suitName: PropTypes.string,
    placeName: PropTypes.string,
    profileId: PropTypes.number,
    placeId: PropTypes.number,
    suitId: PropTypes.number
  }).isRequired
}

export default Header
