import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

export const usePlaceValue = placeId => {
  const [place, setPlace] = useState(null)

  const fetchInitialPlace = useCallback(async () => {
    if (place || !placeId) return

    const { data } = await axios.get(`/api/v1/places/${placeId}`)
    setPlace({ value: data.id, label: data.name, ...data })
  }, [place, placeId])

  useEffect(() => {
    fetchInitialPlace()
  }, [fetchInitialPlace])

  return [place, setPlace]
}
