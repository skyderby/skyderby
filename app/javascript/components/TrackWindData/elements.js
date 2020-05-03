import styled from 'styled-components'

import { devices } from 'styles/devices'

export const Container = styled.div`
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
