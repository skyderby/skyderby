import React, {
  createRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react'
import debounce from 'lodash.debounce'
import cx from 'clsx'

import { drawCard, updateCardNumbers } from './utils'
import styles from './styles.module.scss'
import { ProfileRecord } from 'api/profiles'
import { Competitor, Result } from 'api/performanceCompetitions'
import { PlayerPoint } from '../types'

type CompetitorCardsProps = {
  group: (Competitor & { profile: ProfileRecord; result: Result })[]
  horizontal?: boolean
}

export type CompetitorCardsHandle = {
  drawFrame: (paths: PlayerPoint[][]) => unknown
}

const CompetitorCards = forwardRef<CompetitorCardsHandle, CompetitorCardsProps>(
  ({ group, horizontal }, ref) => {
    const cardRefs = useMemo(
      () => Object.fromEntries(group.map(({ id }) => [id, createRef<HTMLDivElement>()])),
      [group]
    )
    const lastOrder = useRef<string>()

    const setOrder = useCallback(
      (ids: string[]) => {
        const cardHeight = cardRefs[ids[0]]?.current?.getBoundingClientRect()?.height ?? 0
        const cardWidth = cardRefs[ids[0]]?.current?.getBoundingClientRect()?.width ?? 0
        const margin = cardHeight / 5

        ids.forEach((id: string, idx: number) => {
          const card = cardRefs[id].current

          if (!card) return

          if (horizontal) {
            card.style.transform = `translate(${(cardWidth + margin) * idx}px, 0px)`
          } else {
            card.style.transform = `translate(0px, ${(cardHeight + margin) * idx}px)`
          }
        })
      },
      [cardRefs]
    )

    const debouncedSetOrder = useMemo(() => debounce(setOrder, 200), [setOrder])

    const orderCards = (data: PlayerPoint[]) => {
      const enteredWindow = data.length > 0 && Number.isFinite(data[0].taskResult)

      if (!enteredWindow) return

      const orderedIds = data
        .map(point => ({ id: point.id, result: point.taskResult }))
        .sort((a, b) => Number(b.result) - Number(a.result))
        .map(({ id }) => String(id))

      const currentOrder = orderedIds.join('-')

      if (currentOrder !== lastOrder.current) {
        debouncedSetOrder(orderedIds)
        lastOrder.current = currentOrder
      }
    }

    const drawFrame = (paths: PlayerPoint[][]) => {
      const data = paths.map(points => points[points.length - 1])

      data.forEach(point => {
        const ctx = cardRefs[point.id].current?.querySelector('canvas')?.getContext('2d')
        if (!ctx) return

        updateCardNumbers(ctx, point)
      })

      orderCards(data)
    }

    useImperativeHandle(ref, () => ({ drawFrame }))

    useEffect(() => {
      group.forEach((el, idx) => {
        const ctx = cardRefs[el.id].current?.querySelector('canvas')?.getContext('2d')
        if (!ctx) return

        drawCard(ctx, el, idx)
      })

      debouncedSetOrder(Object.keys(cardRefs))
    }, [group, cardRefs, debouncedSetOrder])

    return (
      <div className={cx(styles.container, horizontal && styles.horizontal)}>
        {group.map(record => (
          <div className={styles.card} key={record.id} ref={cardRefs[record.id]}>
            <canvas width={750} height={250} />
          </div>
        ))}
      </div>
    )
  }
)

CompetitorCards.displayName = 'CompetitorCards'

export default CompetitorCards
