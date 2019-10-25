import styled from 'styled-components'

export const Card = styled.div`
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  color: #555;
  font-size: 32px;
  display: flex;
  margin-bottom: 30px;
  padding: 15px 20px;
  width: 500px;
`

export const Rank = styled.div`
  width: 10%;
`

export const Details = styled.div`
  flex-basis: 0;
  flex-grow: 1;

  ul {
    padding: 0;
    margin: 0;
    color: #999;
    font-size: 14px;
    font-style: italic;
  }
`

export const Points = styled.div`
  text-align: center;
  width: 20%;
`
