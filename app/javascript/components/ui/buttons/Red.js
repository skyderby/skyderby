import styled, { css } from 'styled-components'

import DefaultButton from './Default'

const RedButton = styled(DefaultButton)`
  border-color: var(--red-70);

  ${props => props.outlined
    ? css`
      background-color: var(--white);
      color: var(--red-70);
    `
    : css`
      background-color: var(--red-70);
      color: var(--white);
    `
  }


  &:hover {
    border-color: var(--red-80);

    ${props => props.outlined
      ? css`
        background-color: var(--white);
        color: var(--red-80);
      `
      : css`
        background-color: var(--red-80);
        color: var(--white);
      `
    }
  }
`

export default RedButton
