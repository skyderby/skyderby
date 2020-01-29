import styled from 'styled-components'

export const Container = styled.div`
  font-family: 'Proxima Nova Regular';
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1rem;
`

export const Row = styled.div`
  display: flex;
`

export const ProfileContainer = styled.div`
  display: flex;

  img {
    border-radius: 50%;
    margin-right: 0.5rem;
    height: 2rem;
    width: 2rem;
  }
`

export const SuitContainer = styled.div`
  svg {
    height: 0.75rem;
    margin-right: 0.25rem;

    path {
      fill: #999;
    }
  }
`

export const PlaceContainer = styled.div`
  margin-left: 2.5rem;
  margin-right: 1rem;

  svg {
    height: 0.75rem;
    margin-right: 0.25rem;

    path {
      fill: #999;
    }
  }
`

export const PilotName = styled.div`
  font-size: 1.5rem;
  line-height: 2rem;
`
