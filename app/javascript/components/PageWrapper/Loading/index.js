import React from 'react'

import { Container, Spinner, Outer, Inner, Caption } from './elements'

const PageLoading = () => (
  <Container>
    <Spinner>
      <Outer />
      <Inner />
    </Spinner>
    <Caption>loading</Caption>
  </Container>
)

export default PageLoading
