import styled from 'styled-components'

export const Form = styled.form`
  padding: 1rem;
`

export const InputContainer = styled.div`
  flex-grow: 1;

  > :not(:first-child) {
    margin-top: 0.5rem;
  }
`

export const SuitInputModeToggle = styled.div`
  font-size: 0.825rem;

  && {
    margin: 0;
  }
`

export const ErrorMessage = styled.div`
  font-size: 0.825rem;
  color: var(--red-80);
`
