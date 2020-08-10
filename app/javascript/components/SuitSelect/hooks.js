import { useEffect, useState, useCallback, useRef } from 'react'

import Api from 'api'

export const useSuitValue = suitId => {
  const [suit, setSuit] = useState(null)
  const suitsCache = useRef({})

  const getSuitData = useCallback(async suitId => {
    if (!suitsCache[suitId]) {
      const data = await Api.Suit.findRecord(suitId)
      suitsCache[suitId] = data
    }

    return suitsCache[suitId]
  }, [])

  const fetchInitialSuit = useCallback(async () => {
    if (suit && !suitId) {
      setSuit(null)
      return
    }

    if (suit || !suitId) return

    const data = await getSuitData(suitId)
    setSuit({ value: data.id, label: data.name, ...data })
  }, [suit, suitId, getSuitData])

  useEffect(() => {
    fetchInitialSuit()
  }, [fetchInitialSuit])

  return [suit, setSuit]
}
