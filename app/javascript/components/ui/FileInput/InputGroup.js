import styled, { css } from 'styled-components'

import Input from 'components/ui/Input'
import Button from 'components/ui/buttons/Default'

const InputGroup = styled.div`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  position: relative;

  ${Input} {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: 0;
    transition: background-color 150ms linear;

    ${props =>
      props.disabled &&
      css`
        background-color: var(--grey-10);
      `}
  }

  input[type='file'] {
    cursor: inherit;
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    min-width: 100%;

    ::-webkit-file-upload-button {
      cursor: inherit;
    }
  }

  ${Button} {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    position: relative;
    min-width: 2.25rem;
    overflow: hidden;
    transition: background-color 150ms linear;

    ${props =>
      props.disabled &&
      css`
        background-color: var(--grey-10);
        pointer-events: none;
      `}
  }
`

export default InputGroup
