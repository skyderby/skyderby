import styled from 'styled-components'
import { devices } from 'styles/devices'
import { Link } from 'react-router-dom'

export const Container = styled.div`
  @media ${devices.small} {
    box-shadow: var(--block-box-shadow);
    border-radius: var(--border-radius-md);
    background-color: var(--white);
    padding: 0.75rem 1rem;
  }
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
  display: none;

  @media ${devices.small} {
    display: table-header-group;
    font-family: 'Proxima Nova Semibold';

    ${TableCell} {
      color: #777;
      border-bottom: solid 2px var(--border-color);
      white-space: nowrap;
    }
  }
`

export const Tr = styled.div`
  display: table-row;
`

const Attribute = styled.div`
  @media ${devices.small} {
    color: inherit;
    display: table-cell;
    font-size: inherit;
    font-family: inherit;
    padding: 0.5rem;
    line-height: inherit;
  }
`

export const Result = styled(Attribute)`
  display: none;
  text-align: right;
`

export const Id = styled(Attribute)`
  flex: 50%;
  order: 0;
  color: #999;

  ::before {
    content: '#';
  }

  @media ${devices.small} {
    ::before {
      content: '';
    }
  }
`

export const Pilot = styled(Attribute)`
  flex: 100%;
  font-family: 'Proxima Nova Semibold';
  order: 1;
  font-size: 1.5rem;
  line-height: 2.5rem;
`

export const Suit = styled(Attribute)`
  flex: 50%;
  order: 3;
  text-align: right;

  @media ${devices.small} {
    text-align: left;
  }
`

export const Place = styled(Attribute)`
  flex: 50%;
  order: 2;
`

export const Comment = styled(Attribute)`
  flex: 100%;
  order: 4;
  color: #999;

  :not(:empty) {
    margin-top: 0.5rem;
  }
`

export const Timestamp = styled(Attribute)`
  flex: 50%;
  order: 0;
  color: #999;
  text-align: right;
`

export const TrackLink = styled(Link)`
  display: flex;
  flex-wrap: wrap;
  color: #333;
  box-shadow: var(--block-box-shadow);
  background-color: #fff;
  margin-bottom: 0.75rem;
  padding: 1rem;

  :hover {
    color: #333;
    text-decoration: none;
  }

  @media ${devices.small} {
    display: table-row;
    box-shadow: none;
    margin: 0;
    padding: 0;

    :not(:last-child) ${Attribute} {
      border-bottom: solid 1px var(--border-color);
    }

    :hover {
      > :first-child {
        box-shadow: inset 3px 0 0 var(--blue-40);
      }
    }
  }
`

export const Tbody = styled.div`
  @media ${devices.small} {
    display: table-row-group;
  }
`
