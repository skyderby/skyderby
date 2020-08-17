import styled from 'styled-components'

import { devices } from 'styles/devices'

export const Container = styled.div`
  display: grid;
  grid-gap: 0.5rem;
  margin-bottom: 1rem;

  @media ${devices.small} {
    grid-template-columns: 3fr 1fr;
  }
`
