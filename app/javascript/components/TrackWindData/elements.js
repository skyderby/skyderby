import styled from 'styled-components'

export const Table = styled.table`
  font-family: 'Proxima Nova Regular';
  margin-left: auto;
  margin-right: auto;

  thead {
    font-family: 'Proxima Nova Semibold';

    th {
      border-bottom: solid 2px var(--border-color);
      color: #777;
      padding: 0.5rem 1rem;
      white-space: nowrap;
    }
  }

  tbody {
    td {
      border-bottom: solid 1px var(--border-color);
    }
  }

  th,
  td {
    text-align: center;
    padding: 0.5rem;
  }
`
