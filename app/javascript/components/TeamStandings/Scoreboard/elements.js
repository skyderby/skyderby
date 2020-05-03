import styled from 'styled-components'

import FlatButton from 'components/ui/FlatButton'

export const Table = styled.table`
  background-color: #fff;
  border: solid 1px var(--border-color);
  border-collapse: collapse;
  width: 100%;
  font-family: 'Proxima Nova Regular';

  thead {
    font-family: 'Proxima Nova Semibold';
  }

  th {
    color: #777;
    text-transform: uppercase;
    white-space: nowrap;
  }

  td,
  th {
    border: solid 1px var(--border-color);
    padding: 12px 16px;
    font-size: 16px;

    ${FlatButton} {
      opacity: 0;
    }
  }

  td:hover,
  th:hover {
    ${FlatButton} {
      opacity: 1;
    }
  }

  td:last-child,
  th:last-child {
    width: 5%;
    text-align: right;
  }

  td:first-child,
  th:first-child {
    text-align: center;
  }
`

export const TeamDetails = styled.div`
  align-items: center;
  display: flex;

  ul {
    padding: 0;
    margin: 0;
    color: #999;
    font-size: 14px;
    text-transform: capitalize;
  }
`

export const TeamName = styled.div`
  width: 50%;

  > :not(:last-child) {
    margin-right: 5px;
  }
`
