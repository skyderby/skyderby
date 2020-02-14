import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
  width: 100%;
  margin: 0 auto;

  @media ${devices.large} {
    width: 1200px;
  }
`
