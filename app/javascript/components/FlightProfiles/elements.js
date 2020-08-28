import styled from 'styled-components'

import { devices } from 'styles/devices'

export const Container = styled.div`
  display: grid;
  width: 100%;

  @media ${devices.small} {
    position: absolute;
    top: 60px;
    bottom: 41px;
    left: 0;
    right: 0;
    grid-template-columns: 350px 1fr;
    grid-template-rows: 100%;
  }
`

export const SettingsContainer = styled.div`
  display: grid;
  grid-template-rows: minmax(300px, 1fr) 60px;

  @media ${devices.small} {
    border-right: solid 1px var(--border-color);
  }
`

export const TerrainProfileSelectContainer = styled.div`
  border-top: solid 1px var(--border-color);
  background-color: var(--white);
  display: flex;
  align-items: center;
  padding: 0 1rem;
`

export const ChartsContainer = styled.div`
  display: grid;
  background-color: var(--white);
  grid-template-rows: minmax(300px, 1fr) 2rem 9rem;
  grid-gap: 0.5rem;
  width: 100%;
`
