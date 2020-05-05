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
    padding: 0.375rem 0;
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
  border-radius: 4px;
  border: solid 1px var(--border-color);
  padding: 1rem 0.5rem 0.5rem;
  width: 100%;
  height: 0;
  padding-bottom: calc(100% * (9 / 16));
`

export const InputContainer = styled.div`
  width: 150px;
`

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
`
