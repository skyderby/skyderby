import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { selectProfile, selectProfilePhoto } from 'redux/profiles'

import { ProfileContainer, PilotName } from './elements'

const defaultPhotoUrl = '/images/thumb/missing.png'

const Profile = ({ profileId, pilotName: userProvidedName }) => {
  const profile = useSelector(state => selectProfile(state, profileId))
  const photo = useSelector(state => selectProfilePhoto(state, profileId))

  const pilotName = profileId ? profile.name : userProvidedName
  const { thumb: photoUrl = defaultPhotoUrl } = photo || {}

  return (
    <ProfileContainer>
      <img src={photoUrl} />
      <PilotName>{pilotName}</PilotName>
    </ProfileContainer>
  )
}

Profile.propTypes = {
  profileId: PropTypes.number,
  pilotName: PropTypes.string
}

export default Profile
