import styled from 'styled-components'

export const Container = styled.div`
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: auto;
  font-family: 'Proxima Nova Regular';
  padding-left: 0.25rem;
`

export const SearchContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  min-width: 0;
  position: relative;
`

export const TokensList = styled.ul`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  flex-wrap: wrap;
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
  border-radius: 4px;
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

export const SearchInput = styled.input`
  border: 0;
  outline: none;
`

export const Dropdown = styled.div`
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  left: 0;
  margin-top: 0.25rem;
  width: 100%;
  max-width: 280px;
  padding: 0.5rem 0;
  position: absolute;
  top: 100%;
`

export const DropdownMenu = styled.ul`
  margin: 0;
  padding: 0;
`

export const DropdownItem = styled.li`
  cursor: pointer;
  padding: 0.5rem 0.75rem;

  svg {
    height: 0.8em;
    width: 1rem;
    path {
      fill: #777;
    }
  }

  > :not(:last-child) {
    margin-right: 0.25rem;
  }

  &:hover {
    background-color: #eee;
  }
`
