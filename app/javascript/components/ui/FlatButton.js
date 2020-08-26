import styled, { css } from 'styled-components'

const FlatButton = styled.button`
  align-items: center;
  background-color: transparent;
  border-radius: var(--border-radius-md);
  border: none;
  color: rgb(35, 82, 124);
  cursor: pointer;
  display: inline-flex;
  font-size: 0.825rem;
  padding: 0.25em 0.5em;

  > :not(:last-child) {
    margin-right: 0.25em;
  }

  ${props =>
    props.active
      ? css`
          color: var(--grey-80);
          background-color: var(--grey-20);
        `
      : ''}

  &:hover {
    color: #333;
    background-color: var(--grey-20);
  }

  &:focus {
    outline: none;
  }

  svg {
    height: 1em;
    width: 1em;

    path {
      fill: var(--grey-70);
    }
  }
`

export default FlatButton
