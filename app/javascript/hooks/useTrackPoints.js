import { useEffect, useState } from 'react'
import axios from 'axios'

const useTrackPoints = (trackId, options = {}) => {
  const [points, setPoints] = useState([])

  useEffect(() => {
    let isCancelled = false
    const dataUrl = `/api/v1/tracks/${trackId}/points?trimmed=${options.trimmed}`
    axios.get(dataUrl).then(({ data }) => {
      if (isCancelled) return
      setPoints(data)
    })
    return () => (isCancelled = true)
  }, [trackId, options.trimmed])

  return points
}

export default useTrackPoints
