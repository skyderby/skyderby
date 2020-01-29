import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

export const useProfileValue = profileId => {
  const [profile, setProfile] = useState(null)

  const fetchInitialProfile = useCallback(async () => {
    if (profile || !profileId) return

    const { data } = await axios.get(`/api/v1/profiles/${profileId}`)
    setProfile({ value: data.id, label: data.name, ...data })
  }, [profile, profileId])

  useEffect(() => {
    fetchInitialProfile()
  }, [fetchInitialProfile])

  return [profile, setProfile]
}
