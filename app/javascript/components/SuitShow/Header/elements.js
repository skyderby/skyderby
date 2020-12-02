import styled from 'styled-components'

export const Container = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  box-shadow: var(--block-box-shadow);
  display: grid;
  grid-gap: 0.5rem;
  padding: 1rem 1rem 0;
`

export const Title = styled.h2`
  color: var(--grey-80);
  font-family: 'Proxima Nova Bold';
  font-size: 2rem;
  margin: 0;
`

export const Subtitle = styled.small`
  color: var(--grey-70);
  font-family: 'Proxima Nova Semibold';
  font-size: 1.125rem;
`

export const Navbar = styled.div`
  display: flex;

  > :not(:last-child) {
    margin-right: 0.5rem;
  }

  a {
    display: inline-block;
    border-bottom: solid 3px transparent;
    color: var(--grey-80);
    font-family: 'Proxima Nova Semibold';

    :focus {
      outline: none;
    }

    &.active {
      color: var(--blue-30);
      cursor: default;
      border-bottom-color: var(--blue-30);

      div:hover {
        background-color: var(--white);
      }
    }

    div {
      border-radius: var(--border-radius-sm);
      padding: 0.5rem 0.75rem;

      :hover {
        background-color: var(--grey-10);
      }
    }
  }
`

export const Spacer = styled.div`
  flex-basis: 100%;
  flex-grow: 1;
  flex-shrink: 1;
`
