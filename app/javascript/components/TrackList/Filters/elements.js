import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
  background-color: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
  margin-bottom: 1rem;
`

export const Header = styled.div`
  border-bottom: solid 1px var(--border-color);
  padding: 0.75rem 1rem;
  font-family: 'Proxima Nova Semibold'
  font-size: 1.25rem;
`

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1rem;

  > * {
    flex-basis: 0;
    flex-grow: 1;
  }

  > *:not(:last-child) {
    margin-bottom: 1rem;
  }

  @media ${devices.small} {
    flex-direction: row;

    > *:not(:last-child) {
      margin-right: 1rem;
      margin-bottom: 0;
    }
  }
`
