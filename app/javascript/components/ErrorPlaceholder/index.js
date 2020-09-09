import React from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import PrimaryButton from 'components/ui/buttons/Primary'
import { Container, Title, Description } from './elements'

const ErrorPlaceholder = ({ title, description, linkBack }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Description>{description}</Description>

      {linkBack && (
        <PrimaryButton as={Link} to={linkBack}>
          Go back
        </PrimaryButton>
      )}
    </Container>
  )
}

ErrorPlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  linkBack: PropTypes.string
}

export default ErrorPlaceholder
