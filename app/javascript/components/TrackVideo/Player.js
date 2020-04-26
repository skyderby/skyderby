import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import PropTypes from 'prop-types'

import useYoutubeApi from 'utils/useYoutubeApi'

const defaultPlayerOptions = {
  height: '390',
  width: '640',
  playerVars: {
    autoplay: 0,
    fs: 0,
    iv_load_policy: 3,
    rel: 0
  }
}

const Player = forwardRef(({ videoId }, ref) => {
  const playerContainerRef = useRef()
  const playerRef = useRef()

  const YT = useYoutubeApi()

  useImperativeHandle(ref, () => ({
    getPlayerTime: () => playerRef.current.getCurrentTime()
  }))

  useEffect(() => {
    if (!YT) return

    if (playerRef.current) {
      playerRef.current.cueVideoById({ videoId })
    } else {
      playerRef.current = new YT.Player(playerContainerRef.current, {
        ...defaultPlayerOptions,
        videoId
      })
    }
  }, [YT, videoId])

  useEffect(() => {
    return () => playerRef.current?.destroy()
  }, [])

  return <div ref={playerContainerRef} />
})

Player.displayName = 'Player'

Player.propTypes = {
  videoId: PropTypes.string
}

export default Player
