import styled, { css } from 'styled-components'

import DefaultButton from './Default'

const RedButton = styled(DefaultButton)`
  border-color: var(--red-70);

  &:hover {
    border-color: var(--red-80);
  }

  ${props =>
    props.outlined
      ? css`
          color: var(--red-70);

          &:hover {
            color: var(--red-80);
          }
        `
      : css`
          background-color: var(--red-70);
          color: var(--white);

          &:hover {
            background-color: var(--red-80);
          }
        `}
`

export default RedButton
