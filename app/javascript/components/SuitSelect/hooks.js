import { useEffect, useState, useCallback, useRef } from 'react'

import Api from 'api'

export const useSuitValue = suitId => {
  const [suit, setSuit] = useState(null)
  const suitsCache = useRef({})

  const getSuitData = useCallback(async suitId => {
    if (!suitsCache.current[suitId]) {
      const suit = await Api.Suit.findRecord(suitId)
      const make = await Api.Manufacturer.findRecord(suit.makeId)

      suitsCache.current[suitId] = { ...suit, make }
    }

    return suitsCache.current[suitId]
  }, [])

  const fetchInitialSuit = useCallback(async () => {
    if (suit && !suitId) {
      setSuit(null)
      return
    }

    if (suit || !suitId) return

    return await getSuitData(suitId)
  }, [suit, suitId, getSuitData])

  useEffect(() => {
    let effectCancelled = false

    fetchInitialSuit().then(data => {
      if (effectCancelled || !data) return

      setSuit({ value: data.id, label: data.name, ...data })
    })

    return () => (effectCancelled = true)
  }, [fetchInitialSuit])

  return [suit, setSuit]
}
