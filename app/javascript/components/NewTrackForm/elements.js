import styled from 'styled-components'

import Label from 'components/ui/Label'

export const Form = styled.form`
  display: grid;
  grid-template-columns: 1rem 3fr 7fr 1rem;
  grid-gap: 0.75rem 0rem;
  font-family: 'Proxima Nova Regular';
  padding-top: 1rem;
  position: relative;

  ${Label} {
    grid-column: 2;
    padding: 0.5rem 0.75rem;
    width: 100%;
  }
`

export const InputContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 0.125rem 0;
  grid-column: 3;
`

export const SuitInputModeToggle = styled.div`
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

export const Footer = styled.div`
  background-color: var(--grey-10);
  display: flex;
  justify-content: flex-end;
  grid-column: 1/5;
  padding: 0.75rem 1rem;
`
