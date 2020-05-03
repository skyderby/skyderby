import styled from 'styled-components'

export default styled.button`
  background-color: #fff;
  border-radius: 4px;
  border: solid 1px var(--border-color);
  color: #555;
  font-family: 'Proxima Nova Regular';
  height: 30px;
  line-height: 30px;
  outline: none;
  padding: 0 12px;
  webkit-appearance: button;

  :not(:last-child) {
    margin-right: 10px;
  }

  &:hover {
    background-color: #f6f8f9;
    border-color: #9ca6af;
    color: #333;
  }

  &:disabled {
    background-color: #e8ecee;
    border: solid 1px #e8ecee;
    color: #333;
  }
`
