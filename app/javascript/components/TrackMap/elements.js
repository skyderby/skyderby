import styled from 'styled-components'
import { devices } from 'styles/devices'

export const MapElement = styled.div`
  height: 500px;
  width: 100%;
`

export const WindAloftChartContainer = styled.div`
  position: unset;
  height: 40%;

  @media ${devices.small} {
    position: absolute;
    bottom: 20px;
    left: 0;
    height: 250px;
    width: 260px;
  }
`

export const SpeedScaleContainer = styled.div`
  display: flex;
  color: #f4f4f4;

  > * {
    flex-basis: 10%;
    flex-shrink: 1;
    flex-grow: 1;
    text-align: center;
  }

  > :nth-child(1) {
    background-color: #2d7e2e;
  }

  > :nth-child(2) {
    background-color: #42c043;
  }

  > :nth-child(3) {
    background-color: #d9ce34;
  }

  > :nth-child(4) {
    background-color: #e4670f;
  }

  > :nth-child(5) {
    background-color: #e7000c;
  }

  > :nth-child(6) {
    background-color: #60000c;
  }
`
