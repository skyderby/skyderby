import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

export const Menu = styled.ul`
  padding: 0;
  margin: 0;

  :not(:last-child) {
    margin-bottom: 0.5rem;
  }
`

export const Separator = styled.li`
  margin-bottom: 1rem;
`

export const Title = styled.div`
  font-family: 'Proxima Nova Semibold';
  font-size: 1.125rem;
  color: var(--grey-80);

  border-left: solid 1px transparent;
`

export const Subtitle = styled.div`
  font-family: 'Proxima Nova Regular';
  color: var(--grey-70);
`

export const LinkContent = styled.div`
  border-left: solid 3px transparent;
  padding-left: 0.5rem;
`

export const MenuLink = styled(NavLink)`
  border-radius: var(--border-radius-sm);
  display: block;
  padding: 0.5rem 1rem;

  :focus {
    outline: none;
  }

  :hover {
    background-color: var(--grey-20);
  }
  &.active {
    ${LinkContent} {
      border-left-color: var(--blue-40);
    }
  }
`
