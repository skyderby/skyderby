import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
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
