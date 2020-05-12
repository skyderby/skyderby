import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  useMemo,
  useCallback,
  forwardRef
} from 'react'
import PropTypes from 'prop-types'

import useYoutubeApi from './useYoutubeApi'
import PlayIcon from './PlayIcon'
import { PlayerContainer } from './elements'

const Player = forwardRef(({ videoId, onPlay, onPause }, ref) => {
  const [player, setPlayer] = useState()
  const [playerReady, setPlayerReady] = useState()
  const playerContainerRef = useRef()
  const YT = useYoutubeApi()

  useImperativeHandle(ref, () => ({
    getPlayerTime: () => player?.getCurrentTime?.()
  }))

  const onPlayerReady = useCallback(() => setPlayerReady(true), [setPlayerReady])

  const onPlayerStateChange = useCallback(
    event => {
      if (event.data === YT.PlayerState.PAUSED) onPause?.()
      if (event.data === YT.PlayerState.PLAYING) onPlay?.()
    },
    [YT, onPause, onPlay]
  )

  const playerOptions = useMemo(
    () => ({
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      },
      playerVars: {
        autoplay: 0,
        fs: 0,
        iv_load_policy: 3,
        rel: 0
      }
    }),
    [onPlayerReady, onPlayerStateChange]
  )

  useEffect(() => {
    if (!YT) return

    setPlayer(new YT.Player(playerContainerRef.current, playerOptions))
  }, [YT, playerOptions])

  useEffect(() => {
    if (!playerReady || !videoId) return

    player.cueVideoById({ videoId })
  }, [player, playerReady, videoId])

  useEffect(() => {
    return () => player?.destroy()
  }, [player])

  return (
    <PlayerContainer>
      {playerReady || <PlayIcon />}
      <div ref={playerContainerRef} />
    </PlayerContainer>
  )
})

Player.displayName = 'Player'

Player.propTypes = {
  videoId: PropTypes.string,
  onPlay: PropTypes.func,
  onPause: PropTypes.func
}

export default Player
