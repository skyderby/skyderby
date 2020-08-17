import styled, { css } from 'styled-components'
import { devices } from 'styles/devices'

export default styled.button`
  background-color: var(--white);
  border-radius: var(--border-radius-md);
  border: solid 1px var(--grey-30);
  color: var(--grey-80);
  cursor: pointer;
  font-family: 'Proxima Nova Regular';
  font-size: 0.875rem;
  line-height: normal;
  outline: none;
  padding: 0.5rem 0.75rem;
  webkit-appearance: button;

  :not(:last-child) {
    margin-right: 10px;
  }

  &:not(:disabled):hover {
    border-color: var(--blue-50);
    color: var(--blue-50);
  }

  &:disabled {
    opacity: 0.3;
  }

  ${props =>
    props.size === 'xs'
      ? css`
          font-size: 1rem;
          line-height: 1.5;
          padding: 3px 1em 1px;

          @media ${devices.small} {
            font-size: 0.75rem;
          }
        `
      : ''}

  ${props =>
    props.rounded
      ? css`
          border-radius: 1.5em;
        `
      : ''}
`
