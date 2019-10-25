import styled from 'styled-components'

const FlatButton = styled.button`
  background-color: transparent;
  border-radius: 4px;
  border: none;
  color: rgb(35, 82, 124);
  font-size: 12px;
  margin-right: 0.25rem;
  padding: 3px 6px;

  &:hover {
    color: #555;
    background-color: #ddd;
  }
`

export default FlatButton
