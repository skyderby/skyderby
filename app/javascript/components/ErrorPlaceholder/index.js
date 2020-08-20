import React from 'react'
import PropTypes from 'prop-types'

import { Container, Title, Description } from './elements'

const ErrorPlaceholder = ({ title, description, children }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Description>{description}</Description>

      {children}
    </Container>
  )
}

ErrorPlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node
}

export default ErrorPlaceholder
