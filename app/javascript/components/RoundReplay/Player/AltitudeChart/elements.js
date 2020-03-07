import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Canvas = styled.canvas`
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media ${devices.small} {
    width: 80%;
  }
`
