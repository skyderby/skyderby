import styled from 'styled-components'

import { devices } from 'styles/devices'

export const Section = styled.div`
  display: flex;
  flex-wrap: wrap;

  :not(:last-child) {
    margin-bottom: 2rem;
  }

  @media ${devices.small} {
    flex-wrap: nowrap;
  }
`

export const Description = styled.div`
  width: 100%;
  padding-right: 16px;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 2.125rem;
  }

  @media ${devices.small} {
    width: 30%;
  }
`

export const Controls = styled.div`
  width: 100%;

  > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  @media ${devices.small} {
    width: 70%;
  }
`

export const TrackChartCard = styled.div`
  width: 100%;
  border: solid 1px var(--border-color);
  border-radius: 4px;
  padding: 1rem 0.5rem 0.5rem 0.5rem;
`

export const ControlsContainer = styled.div`
  display: flex;

  > input {
    max-width: 100px;
  }

  > *:not(:last-child) {
    margin-right: 0.5rem;
  }
`

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
`
