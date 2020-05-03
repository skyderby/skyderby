import styled from 'styled-components'

import { devices } from 'styles/devices'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  @media ${devices.small} {
    position: absolute;
    top: 60px;
    bottom: 41px;
    left: 0;
    right: 0;
    flex-direction: row;
  }
`

export const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  order: 2;
  position: relative;
  padding-bottom: 60px;

  @media ${devices.small} {
    border-right: solid 1px var(--border-color);
    width: 350px;
    order: 1;
  }
`

export const ChartsAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  order: 1;

  @media ${devices.small} {
    width: calc(100% - 300px);
    order: 2;
  }
`
