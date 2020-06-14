export const selectProfile = (state, profileId) => {
  const { byId } = state.profiles

  return byId[profileId]
}

export const selectProfilePhoto = (state, profileId) => {
  if (!profileId) return null

  const { byId } = state.profiles

  const profile = byId[profileId]

  return profile.photo || {}
}

export const createProfileSelector = profileId => state => selectProfile(state, profileId)
