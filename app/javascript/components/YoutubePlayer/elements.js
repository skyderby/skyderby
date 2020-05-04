import styled from 'styled-components'

export const PlayerContainer = styled.div`
  position: relative;
  padding-bottom: calc(100% * (9 / 16));
  height: 0;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`
