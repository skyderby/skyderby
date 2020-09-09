import styled from 'styled-components'

export const Container = styled.div`
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  font-family: 'Proxima Nova Regular';
  padding-left: 0.25rem;
`

export const TokensList = styled.ul`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-wrap: wrap;
  list-style-type: none;
  margin: 0;
  padding: 0.25rem 0 0 0;
  position: relative;
  width: 1px;

  > li {
    margin-right: 0.25rem;
    margin-bottom: 0.25rem;
  }
`

export const ClearButton = styled.button`
  background-color: transparent;
  border: 0.25rem solid var(--white);
  border-radius: var(--border-radius-md);
  width: 2rem;
  outline: none;

  svg {
    height: 0.75em;
    fill: rgba(0, 0, 0, 0.55);
  }

  &:hover {
    background-color: var(--grey-10);

    svg {
      fill: rgba(0, 0, 0, 0.85);
    }
  }
`
