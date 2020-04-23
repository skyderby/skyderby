import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import CogIcon from 'icons/cog.svg'
import Profile from './Profile'
import Suit from './Suit'
import Place from './Place'
import { Container, Row } from './elements'

const Header = ({ track }) => {
  return (
    <Container>
      <Row>
        <Profile profileId={track.profileId} pilotName={track.name} />
        <Link to={`/tracks/${track.id}/edit`}><CogIcon />Edit</Link>
      </Row>
      <Row>
        <Place placeId={track.placeId} placeName={track.placeName} />
        <Suit suitId={track.suitId} suitName={track.suitName} />
      </Row>
    </Container>
  )
}

Header.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string,
    suitName: PropTypes.string,
    placeName: PropTypes.string,
    profileId: PropTypes.number,
    placeId: PropTypes.number,
    suitId: PropTypes.number
  }).isRequired
}

export default Header
