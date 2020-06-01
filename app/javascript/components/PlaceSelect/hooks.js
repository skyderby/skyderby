import { useEffect, useState, useCallback } from 'react'
import Api from 'api'

export const usePlaceValue = placeId => {
  const [place, setPlace] = useState(null)

  const fetchInitialPlace = useCallback(async () => {
    if (place || !placeId) return

    const data = await Api.Place.findRecord(placeId)
    setPlace({ value: data.id, label: data.name, ...data })
  }, [place, placeId])

  useEffect(() => {
    fetchInitialPlace()
  }, [fetchInitialPlace])

  return [place, setPlace]
}
