import styled from 'styled-components'

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
