import { useEffect, useState, useCallback } from 'react'
import Api from 'api'

export const usePlaceValue = placeId => {
  const [place, setPlace] = useState(null)

  const fetchInitialPlace = useCallback(async () => {
    if (place || !placeId) return

    return await Api.Place.findRecord(placeId)
  }, [place, placeId])

  useEffect(() => {
    let effectCancelled = false

    fetchInitialPlace().then(data => {
      if (effectCancelled || !data) return

      setPlace({ value: data.id, label: data.name, ...data })
    })

    return () => (effectCancelled = true)
  }, [fetchInitialPlace])

  return [place, setPlace]
}
