import styled from 'styled-components'
import { devices } from 'styles/devices'

export const PageContainer = styled.div`
  width: 100%;
  margin: 0 auto;

  @media ${devices.large} {
    width: 1200px;
  }
`

export const TrackDataContainer = styled.div`
  background-color: #fff;
  width: 100%;
  padding: 1rem;
  border: solid 1px transparent;
  border-top-color: #e0e0e0;
  border-bottom-color: #e0e0e0;

  @media ${devices.large} {
    border-left-color: #e0e0e0;
    border-right-color: #e0e0e0;
  }
`
