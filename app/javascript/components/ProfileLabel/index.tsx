import React from 'react'
import { useProfileQuery } from 'api/profiles'
import ProfileName from 'components/ProfileLabel/ProfileName'

interface Props {
  id: number
  className?: string
}

const ProfileLabel = ({ id, className }: Props) => {
  const { data: profile } = useProfileQuery(id, { enabled: false })

  if (!profile) return null

  return <ProfileName profile={profile} className={className} />
}

export { ProfileName }
export default ProfileLabel
