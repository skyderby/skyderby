import styled from 'styled-components'
import FlatButton from 'components/ui/FlatButton'

export const Container = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: flex-end;

  ${FlatButton} {
    font-size: 1rem;
    text-transform: uppercase;
    color: #777;
  }
`

export const FormBody = styled.div`
  font-family: 'Proxima Nova Regular';
  padding: 15px;
`

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  &:not(:last-child) {
    margin-bottom: 15px;
  }
`

export const Label = styled.label`
  display: block;
  font-family: 'Proxima Nova Semibold';
`

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding: 10px 15px;
`
