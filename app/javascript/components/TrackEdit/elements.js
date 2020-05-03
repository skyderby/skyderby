import styled from 'styled-components'
import { devices } from 'styles/devices'

export const PageContainer = styled.div`
  width: 100%;
  margin: 0 auto;

  @media ${devices.large} {
    width: 1200px;
  }
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

export const FormGroup = styled.div``
