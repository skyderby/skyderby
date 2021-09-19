import React, {
  useRef,
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react'

import useYoutubeApi from './useYoutubeApi'
import PlayIcon from './PlayIcon'
import styles from './styles.module.scss'

type PlayerProps = {
  videoId: string | undefined
  onPlay?: () => void
  onPause?: () => void
}

const Player = forwardRef(({ videoId, onPlay, onPause }: PlayerProps, ref) => {
  const YT = useYoutubeApi()
  const [player, setPlayer] = useState<YT.Player>()
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const onPlayRef = useRef<PlayerProps['onPlay']>()
  const onPauseRef = useRef<PlayerProps['onPause']>()
  onPlayRef.current = onPlay
  onPauseRef.current = onPause

  useImperativeHandle(ref, () => ({
    getPlayerTime: () => player?.getCurrentTime?.()
  }))

  useEffect(() => {
    if (!YT || player) return

    const playerOptions = {
      events: {
        onReady: (event: YT.PlayerEvent) => setPlayer(event.target),
        onStateChange: (event: YT.OnStateChangeEvent) => {
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

    if (playerContainerRef.current) {
      new YT.Player(playerContainerRef.current, playerOptions)
    }
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

export default Player
