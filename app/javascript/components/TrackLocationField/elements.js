import styled from 'styled-components'

export const InputContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 0.125rem 0;
  grid-column: 3;
`

export const InputModeToggle = styled.div`
  font-size: 0.825rem;
  line-height: normal;

  && {
    margin: 0;
  }
`

export const ErrorMessage = styled.div`
  font-size: 0.825rem;
  color: var(--red-80);
`
