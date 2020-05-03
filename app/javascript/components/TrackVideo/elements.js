import styled from 'styled-components'

import { devices } from 'styles/devices'

export const Container = styled.div`
  background-color: #fff;
  font-family: 'Proxima Nova Regular';
  width: 100%;
  padding: 1rem;
  border: solid 1px transparent;
  border-top-color: var(--border-color);
  border-bottom-color: var(--border-color);

  @media ${devices.large} {
    border-left-color: var(--border-color);
    border-right-color: var(--border-color);
  }
`

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

  @media ${devices.small} {
    width: 70%;
  }
`

export const TrackChartCard = styled.div`
  width: 100%;
  border: solid 1px transparent;
  border-color: var(--border-color);
  border-radius: 4px;
  padding: 32px 8px 8px 8px;
  margin-bottom: 16px;
`

export const PlayerContainer = styled.div`
  position: relative;
  padding-bottom: calc(100% * (9 / 16));
  height: 0;
  margin-bottom: 16px;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`

export const ControlsContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 150px;
  margin-bottom: 16px;

  > * {
    height: 2rem;
  }

  > *:not(:last-child) {
    margin-right: 1rem;
  }
`

export const Footer = styled.div`
  button {
    margin: 0 0 0 auto;
    width: 100px;
  }
`
