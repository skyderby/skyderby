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
import PropTypes from 'prop-types'

import { drawCard, updateCardNumbers } from './utils'
import { Container, Card } from './elements'

const CompetitorCards = forwardRef(({ discipline, group }, ref) => {
  const cardRefs = useMemo(
    () => Object.fromEntries(group.map(({ id }) => [id, createRef()])),
    [group]
  )
  const lastOrder = useRef()

  const setOrder = useCallback(
    ids => {
      const cardHeight =
        ids.length > 0 ? cardRefs[ids[0]].current?.getBoundingClientRect()?.height : 0
      const margin = cardHeight / 5

      ids.forEach((id, idx) => {
        const card = cardRefs[id].current

        if (!card) return

        card.style.transform = `translate(0px, ${(cardHeight + margin) * idx}px)`
      })
    },
    [cardRefs]
  )

  const debouncedSetOrder = useMemo(() => debounce(setOrder, 200), [setOrder])

  const orderCards = data => {
    const enteredWindow = data.length > 0 && !Number.isNaN(data[0][discipline])

    if (!enteredWindow) return

    const orderedIds = data
      .map(point => ({ id: point.id, result: point[discipline] }))
      .sort((a, b) => b.result - a.result)
      .map(({ id }) => id)

    const currentOrder = orderedIds.join('-')

    if (currentOrder !== lastOrder.current) {
      debouncedSetOrder(orderedIds)
      lastOrder.current = currentOrder
    }
  }

  const drawFrame = paths => {
    const data = paths.map(points => points[points.length - 1])

    data.forEach(point => {
      const ctx = cardRefs[point.id].current.querySelector('canvas').getContext('2d')
      updateCardNumbers(ctx, point, discipline)
    })

    orderCards(data)
  }

  useImperativeHandle(ref, () => ({ drawFrame }))

  useEffect(() => {
    group.forEach((el, idx) => {
      const ctx = cardRefs[el.id].current.querySelector('canvas').getContext('2d')
      drawCard(ctx, el, idx)
    })

    debouncedSetOrder(Object.keys(cardRefs))
  }, [group, cardRefs, debouncedSetOrder])

  return (
    <Container>
      {group.map(record => (
        <Card key={record.id} ref={cardRefs[record.id]}>
          <canvas width={750} height={250} />
        </Card>
      ))}
    </Container>
  )
})

CompetitorCards.displayName = 'CompetitorCards'

CompetitorCards.propTypes = {
  discipline: PropTypes.oneOf(['distance', 'speed', 'time']),
  group: PropTypes.array.isRequired
}

export default CompetitorCards
