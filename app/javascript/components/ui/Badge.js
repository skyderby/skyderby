import styled from 'styled-components';

const colors = {
  blue: '#007bff',
  grey: '#6c757d',
  green: '#28a745',
  red: '#dc3545',
  yellow: '#dc3545',
  teal: '#17a2b8',
  black: '#343a40'
}

export default styled.div`
  align-self: center;
  background-color: ${props => colors[props.color] || colors.black};
  border-radius: 3px;
  font: 11px/11px 'Proxima Nova Semibold';
  color: white;
  padding: 2px 6px 3px 6px;
  vertical-align: baseline;
  white-space: nowrap;
`
