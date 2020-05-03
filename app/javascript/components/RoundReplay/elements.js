import styled from 'styled-components'

export const PlayButton = styled.button`
  background-color: white;
  border: solid 1px var(--border-color);
  border-radius: 4px;
  padding: 8px 14px;
  line-height: 20px;
`

export const PlayerControls = styled.div`
  align-items: center;
  display: flex;
  padding: 15px;
  flex-shrink: 0;

  > :not(:last-child) {
    margin-right: 10px;
  }
`
