import styled, { css } from 'styled-components'

const Input = styled.input`
  border: solid 1px var(--border-color);
  border-radius: var(--border-radius-md);
  color: var(--grey-90);
  flex-grow: 1;
  flex-shrink: 1;
  font-family: 'Proxima Nova Regular';
  font-size: 0.875rem;
  line-height: normal;
  padding: 0.5rem 0.75rem;
  width: 100%;

  ::placeholder {
    font-family: 'Proxima Nova Regular';
    font-size: 0.875rem;
  }

  :disabled {
    color: var(--grey-70);
  }

  ${props =>
    props.hide
      ? css`
          display: none;
        `
      : ''}

  ${props =>
    props.isInvalid
      ? css`
          border-color: var(--red-80);
        `
      : ''}
`

export default Input
