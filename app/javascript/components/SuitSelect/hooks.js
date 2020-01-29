import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

export const useSuitValue = suitId => {
  const [suit, setSuit] = useState(null)

  const fetchInitialSuit = useCallback(async () => {
    if (suit || !suitId) return

    const { data } = await axios.get(`/api/v1/suits/${suitId}`)
    setSuit({ value: data.id, label: data.name, ...data })
  }, [suit, suitId])

  useEffect(() => {
    fetchInitialSuit()
  }, [fetchInitialSuit])

  return [suit, setSuit]
}
