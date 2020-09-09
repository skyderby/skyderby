import React from 'react'
import PropTypes from 'prop-types'

import Sidebar from './Sidebar'

import { Container, Content } from './elements'

const SuitsIndex = ({ children }) => {
  return (
    <Container>
      <Sidebar />

      <div>
        <Content>{children}</Content>
      </div>
    </Container>
  )
}

SuitsIndex.propTypes = {
  children: PropTypes.node.isRequired
}

export default SuitsIndex
