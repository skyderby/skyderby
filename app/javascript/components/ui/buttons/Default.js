import styled from 'styled-components'

export default styled.button`
  background-color: var(--white);
  border-radius: 4px;
  border: solid 1px var(--grey-30);
  color: var(--grey-80);
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
    border-color: var(--blue-50);
    color: var(--blue-50);
  }

  &:disabled {
    opacity: 0.3;
  }
`
