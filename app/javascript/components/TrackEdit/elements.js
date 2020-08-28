import styled from 'styled-components'
import { devices } from 'styles/devices'

import Label from 'components/ui/Label'

export const AltitudeRangeContainer = styled.div`
  grid-column: 1/5;
`

export const PageContainer = styled.div`
  width: 100%;
  margin: 0 auto;

  @media ${devices.large} {
    width: 1200px;
  }
`

export const Form = styled.form`
  display: grid;
  grid-template-columns: 1rem 3fr 7fr 15rem;
  grid-gap: 0.75rem 0rem;
  font-family: 'Proxima Nova Regular';
  padding-top: 1rem;
  position: relative;

  ${Label} {
    grid-column: 2;
    padding: 0.5rem 0.75rem;
    width: 100%;
  }

  hr {
    grid-column: 1/5;
  }
`

export const InputContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 0.125rem 0;
  grid-column: 3;
`

export const ErrorMessage = styled.div`
  font-size: 0.825rem;
  color: var(--red-80);
`

export const FormContainer = styled.div`
  background-color: #fff;
  width: 100%;
  padding: 1rem;
  border: solid 1px transparent;
  border-top-color: var(--border-color);
  border-bottom-color: var(--border-color);

  @media ${devices.large} {
    border-left-color: var(--border-color);
    border-right-color: var(--border-color);
  }
`

export const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  grid-column: 1/5;
`
