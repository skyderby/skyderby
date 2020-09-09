import React from 'react'
import PropTypes from 'prop-types'

import { MenuLink, LinkContent, Title, Subtitle } from './elements'

const MenuItem = ({ title, subtitle, ...props }) => (
  <li>
    <MenuLink {...props}>
      <LinkContent>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </LinkContent>
    </MenuLink>
  </li>
)

MenuItem.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
}

export default MenuItem
