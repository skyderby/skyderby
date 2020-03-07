import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 100%;

  @media ${devices.small} {
    width: 20%;
  }
`

export const Card = styled.div`
  background-color: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: transform 350ms ease-in;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px 0px;
  height: 12vh;

  @media ${devices.small} {
    height: auto;
  }

  canvas {
    max-width: 100%;
    max-height: 100%;
    vertical-align: middle;
  }
`
