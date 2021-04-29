import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'
import PropTypes from 'prop-types'

import useYoutubeApi from './useYoutubeApi'
import PlayIcon from './PlayIcon'

import styles from './styles.module.scss'

const Player = forwardRef(({ videoId, onPlay, onPause }, ref) => {
  const YT = useYoutubeApi()
  const [player, setPlayer] = useState()
  const playerContainerRef = useRef()
  const onPlayRef = useRef()
  const onPauseRef = useRef()
  onPlayRef.current = onPlay
  onPauseRef.current = onPause

  useImperativeHandle(ref, () => ({
    getPlayerTime: () => player?.getCurrentTime?.()
  }))

  useEffect(() => {
    if (!YT || player) return

    const playerOptions = {
      events: {
        onReady: event => setPlayer(event.target),
        onStateChange: event => {
          if (event.data === YT.PlayerState.PAUSED) onPauseRef.current?.()
          if (event.data === YT.PlayerState.PLAYING) onPlayRef.current?.()
        }
      },
      playerVars: {
        autoplay: 0,
        fs: 0,
        iv_load_policy: 3,
        rel: 0
      }
    }

    new YT.Player(playerContainerRef.current, playerOptions)
  }, [YT, player, setPlayer])

  useEffect(() => {
    if (!player || !videoId) return

    player.cueVideoById({ videoId })
  }, [player, videoId])

  useEffect(() => {
    return () => player?.destroy()
  }, [player])

  return (
    <div className={styles.container}>
      {!player && <PlayIcon />}
      <div ref={playerContainerRef} />
    </div>
  )
})

Player.displayName = 'Player'

Player.propTypes = {
  videoId: PropTypes.string,
  onPlay: PropTypes.func,
  onPause: PropTypes.func
}

export default Player
