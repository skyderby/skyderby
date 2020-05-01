import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  useCallback,
  forwardRef
} from 'react'
import PropTypes from 'prop-types'

import useYoutubeApi from 'utils/useYoutubeApi'
import YoutubeIcon from './YoutubeIcon'
import { PlayerContainer } from './elements'

const defaultPlayerOptions = (onPlayerReady, onPlayerStateChange, start = 0) => ({
  events: {
    onReady: onPlayerReady,
    onStateChange: onPlayerStateChange
  },
  playerVars: {
    autoplay: 0,
    fs: 0,
    iv_load_policy: 3,
    rel: 0,
    start: start
  }
})

const Player = forwardRef(({ videoId, setFieldValue = undefined }, ref) => {
  const [playerReady, setPlayerReady] = useState()
  const playerContainerRef = useRef()
  const playerRef = useRef()
  const YT = useYoutubeApi()

  const onPlayerReady = useCallback(() => {
    setPlayerReady(true)
  }, [setPlayerReady])

  // If we can push the "Set" button anytime we want,
  // we need to make sure that the player is ready
  const getPlayerTime = useCallback(() => {
    if (!playerReady) return 0
    const curTime = playerRef.current?.getCurrentTime()
    return Math.round(curTime * 10) / 10
  }, [playerReady])

  const onPlayerStateChange = useCallback(
    event => {
      if (!setFieldValue) return
      if (event.data === 2) {
        // TODO:
        // I don’t know why, but the playerReady flag is not defined here,
        // so I can’t use the getPlayerTime function, and my code is not DRY
        const curTime = playerRef.current?.getCurrentTime()
        setFieldValue('startTime', Math.round(curTime * 10) / 10)
      }
    },
    [setFieldValue]
  )

  useImperativeHandle(ref, () => ({
    getPlayerTime: getPlayerTime
  }))

  useEffect(() => {
    if (!YT) return

    if (playerRef.current) {
      playerRef.current.cueVideoById({ videoId })
    } else {
      playerRef.current = new YT.Player(playerContainerRef.current, {
        ...defaultPlayerOptions(onPlayerReady, onPlayerStateChange),
        videoId
      })
    }
  }, [YT, videoId, onPlayerReady, onPlayerStateChange])

  useEffect(() => {
    return () => playerRef.current?.destroy()
  }, [])

  return (
    <PlayerContainer>
      {!playerReady && <YoutubeIcon />}
      <div ref={playerContainerRef} />
    </PlayerContainer>
  )
})

Player.displayName = 'Player'

Player.propTypes = {
  videoId: PropTypes.string,
  setFieldValue: PropTypes.func
}

export default Player
