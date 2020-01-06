import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Container = styled.div`
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  padding: 0.75rem 1rem;
`

export const TableCell = styled.div`
  display: table-cell;
  padding: 0.5rem;
`

export const Table = styled.div`
  display: table;
  font-family: 'Proxima Nova Regular';
  width: 100%;
`

export const Thead = styled.div`
  display: table-header-group;
  font-family: 'Proxima Nova Semibold';

  ${TableCell} {
    border-bottom: solid 2px #ddd;
    white-space: nowrap;
  }
`

export const Tbody = styled.div`
  display: table-row-group;

  ${TableCell} {
    border-bottom: solid 1px #ddd;
  }
`

export const Tr = styled.div`
  display: table-row;
`

export const TrackLink = styled(Link)`
  display: table-row;
  color: #333;

  :last-child ${TableCell} {
    border-bottom: none;
  }
`
