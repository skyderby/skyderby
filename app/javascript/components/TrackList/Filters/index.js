import React from 'react'
import { Container, Header, Body } from './elements'
import { useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import ProfileSelect, { useProfileValue } from 'components/ProfileSelect'
import PlaceSelect, { usePlaceValue } from 'components/PlaceSelect'
import SuitSelect, { useSuitValue } from 'components/SuitSelect'

const Filters = ({ urlBuilder }) => {
  const history = useHistory()
  const { profileId, suitId, placeId } = Object.fromEntries(
    new URLSearchParams(useLocation().search)
  )

  const [profile, setProfile] = useProfileValue(profileId)
  const [place, setPlace] = usePlaceValue(placeId)
  const [suit, setSuit] = useSuitValue(suitId)

  const updateUrl = params => {
    const newUrl = urlBuilder({ page: null, ...params })
    history.push(newUrl)
  }

  const handleProfileChange = option => {
    setProfile(option)
    updateUrl({ profileId: option && option.value })
  }

  const handleSuitChange = option => {
    setSuit(option)
    updateUrl({ suitId: option && option.value })
  }

  const handlePlaceChange = option => {
    setPlace(option)
    updateUrl({ placeId: option && option.value })
  }

  return (
    <Container>
      <Header>Filters</Header>
      <Body>
        <ProfileSelect
          isClearable
          placeholder="by pilot"
          value={profile}
          onChange={handleProfileChange}
        />
        <SuitSelect
          isClearable
          placeholder="by suit"
          value={suit}
          onChange={handleSuitChange}
        />
        <PlaceSelect
          isClearable
          placeholder="by location"
          value={place}
          onChange={handlePlaceChange}
        />
      </Body>
    </Container>
  )
}

Filters.propTypes = {
  urlBuilder: PropTypes.func.isRequired
}

export default Filters
