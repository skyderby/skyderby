import styled from 'styled-components'

export const Container = styled.div`
  height: 2.1875rem;
  position: relative;
  overflow: hidden;
`

export const Fade = styled.div`
  background: linear-gradient(to left, rgba(250, 250, 250) 45%, rgba(250, 250, 250, 0.4));
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2rem;
  z-index: 2;
`

export const Menu = styled.ul`
  display: flex;
  margin: 0;
  overflow-x: scroll;
  padding: 0 1rem 2rem;
  white-space: nowrap;
  list-style: none;
`

export const MenuItem = styled.li`
  &:not(:last-child) {
    margin-right: 0.5rem;
  }

  &:nth-last-child(2) {
    margin-right: 1.5rem;
  }

  a {
    color: #666;
    display: flex;
    align-items: center;
    font-family: 'Proxima Nova Regular';
    line-height: 2rem;
    border-bottom: solid 3px transparent;
    padding: 0 8px;
    white-space: nowrap;

    svg {
      height: 1em;
      margin-right: 0.25rem;

      path {
        fill: #777;
      }
    }

    &.active {
      color: #333;
      font-family: 'Proxima Nova Semibold';
      border-bottom-color: #0084b4;
    }

    &:focus {
      outline: none;
    }
  }
`

export const Spacer = styled.li`
  width: 2rem;
`
