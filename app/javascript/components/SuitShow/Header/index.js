import React from 'react'
import { NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'

import { Container, Navbar, Title, Subtitle, Spacer } from './elements'

const Header = ({ suit, make }) => {
  return (
    <Container>
      <Title>{suit.name}</Title>
      <Subtitle>{make.name}</Subtitle>

      <Navbar>
        <NavLink exact to={`/suits/${suit.id}`}>
          <div>Overview</div>
        </NavLink>
        <NavLink to={`/suits/${suit.id}/videos`}>
          <div>Videos</div>
        </NavLink>
        <NavLink to={`/suits/${suit.id}/tracks`}>
          <div>Tracks</div>
        </NavLink>

        {suit.editable && (
          <>
            <Spacer />

            <NavLink to={`/suits/${suit.id}/edit`}>
              <div>Edit</div>
            </NavLink>
          </>
        )}
      </Navbar>
    </Container>
  )
}

Header.propTypes = {
  suit: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    editable: PropTypes.bool.isRequired
  }).isRequired,
  make: PropTypes.shape({
    name: PropTypes.string.isRequired
  })
}

export default Header
