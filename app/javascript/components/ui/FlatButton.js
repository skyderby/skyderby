import styled, { css } from 'styled-components'

const FlatButton = styled.button`
  align-items: center;
  background-color: transparent;
  border-radius: var(--border-radius-md);
  border: none;
  color: rgb(35, 82, 124);
  display: flex;
  font-size: 12px;
  margin-right: 0.25rem;
  padding: 0.25rem 0.5rem;

  > :not(:last-child) {
    margin-right: 0.25em;
  }

  ${props =>
    props.active
      ? css`
          color: #555;
          background-color: #ddd;
        `
      : ''}

  &:hover {
    color: #333;
    background-color: #ddd;
  }

  &:focus {
    outline: none;
  }

  svg {
    height: 1em;
    width: 1em;

    path {
      fill: #777;
    }
  }
`

export default FlatButton
