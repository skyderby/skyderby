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

export const Header = styled.h2`
  color: #555;
  font-family: 'Proxima Nova Semibold';
  font-size: 1.2rem;
`
