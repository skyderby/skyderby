import styled from 'styled-components'

export const PlayButton = styled.button`
  border-radius: 4px;
  padding: 8px 14px;
`

export const PlayerControls = styled.div`
  display: flex;
  padding: 15px;

  > :not(:last-child) {
    margin-right: 10px;
  }
`

export const Canvas = styled.canvas`
  width: 180vh;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
`
