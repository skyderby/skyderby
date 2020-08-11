import styled from 'styled-components'

import Label from 'components/ui/Label'

export const Container = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
`

export const Fieldset = styled.div`
  border: 0;
  margin: 0;
  display: flex;
  align-items: baseline;
  padding: 1rem;

  ${Label} {
    width: auto;
    padding: 0;
  }

  > :not(:last-child) {
    margin-right: 0.5rem;
  }
`

export const Footer = styled.div`
  background-color: var(--grey-10);
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1rem;
`
