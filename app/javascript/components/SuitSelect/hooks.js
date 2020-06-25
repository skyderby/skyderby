import { useEffect, useState, useCallback } from 'react'

import Api from 'api'

export const useSuitValue = suitId => {
  const [suit, setSuit] = useState(null)

  const fetchInitialSuit = useCallback(async () => {
    if (suit || !suitId) return

    const data = await Api.Suit.findRecord(suitId)
    setSuit({ value: data.id, label: data.name, ...data })
  }, [suit, suitId])

  useEffect(() => {
    fetchInitialSuit()
  }, [fetchInitialSuit])

  return [suit, setSuit]
}
