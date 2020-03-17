import styled from 'styled-components'

export const Container = styled.div`
  padding: 1rem;

  > :not(:last-child) {
    margin-bottom: 1rem;
  }
`

export const Card = styled.div`
  background-color: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2),
    inset 5px 0 0 ${props => (props.active ? '#75a4ba' : 'transparent')};
  cursor: pointer;
  font-family: 'Proxima Nova Regular';
  padding: 0.75rem 1rem;

  > :not(:last-child) {
    margin-bottom: 0.25rem;
  }
`

export const Row = styled.div`
  display: flex;
  justify-content: space-between;
`

export const Id = styled.span`
  color: #777;

  ::before {
    content: '#';
  }
`

export const RecordedAt = styled.span`
  color: #777;
`

export const Comment = styled.div`
  color: #777;
`
