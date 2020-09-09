import styled from 'styled-components'
import { Link as ReactRouterLink } from 'react-router-dom'

export const Title = styled.h2`
  color: var(--grey-80);
  font-family: 'Proxima Nova Bold';
  font-size: 2rem;
  text-align: center;
  margin: 1rem 0;
`

export const Subtitle = styled.h3`
  color: var(--grey-70);
  font-family: 'Proxima Nova Bold';
  font-size: 1.5rem;
  text-align: center;
`

export const List = styled.ul`
  padding: 0;
  margin: 0;
`

export const Link = styled(ReactRouterLink)`
  align-items: center;
  border-radius: var(--border-radius-sm);
  color: var(--grey-80);
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: 5fr 1fr 1fr 1fr;
  padding: 1rem;

  :hover {
    background-color: var(--grey-10);
    color: var(--grey-80);
  }
`

export const SuitName = styled.div`
  font-family: 'Proxima Nova Semibold';
  font-size: 1.125rem;
`

export const UsageStat = styled.div`
  color: var(--grey-70);
  font-family: 'Proxima Nova Regular';
  text-align: center;
`
