import styled from 'styled-components'

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
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
  padding: 10px 15px;
`

export const Row = styled.div`
  margin-bottom: 6px;
  display: flex;
  align-items: center;

  > :not(:last-child) {
    margin-right: 6px;
  }
`

export const DeleteButton = styled.button`
  background-color: #f1f1f1;
  border: none;
  border-radius: 4px;
  color: #777;
  height: 30px;
  width: 30px;

  &:hover {
    background-color: #ddd;
  }
`
