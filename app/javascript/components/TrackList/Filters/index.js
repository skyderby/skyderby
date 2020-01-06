import React, { useEffect, useCallback, useState } from 'react'
import { Container, Header, Body } from './elements'
import { useHistory, useLocation } from 'react-router-dom'
import axios from 'axios'
import PropTypes from 'prop-types'

import ProfileSelect from 'components/ProfileSelect'
import PlaceSelect from 'components/PlaceSelect'
import SuitSelect from 'components/SuitSelect'

const Filters = ({ urlBuilder }) => {
  const history = useHistory()
  const { profileId, suitId, placeId } = Object.fromEntries(
    new URLSearchParams(useLocation().search)
  )

  const [profile, setProfile] = useState(null)
  const [suit, setSuit] = useState(null)
  const [place, setPlace] = useState(null)

  const setInitialProfileValue = useCallback(async profileId => {
    const { data } = await axios.get(`/api/v1/profiles/${profileId}`)
    setProfile({ value: data.id, label: data.name })
  }, [])

  const setInitialSuitValue = useCallback(async suitId => {
    const { data } = await axios.get(`/api/v1/suits/${suitId}`)
    setSuit({ value: data.id, label: data.name, ...data })
  }, [])

  const setInitialPlaceValue = useCallback(async placeId => {
    const { data } = await axios.get(`/api/v1/places/${placeId}`)
    setPlace({ value: data.id, label: data.name, ...data })
  }, [])

  useEffect(() => {
    if (profile || !profileId) return

    setInitialProfileValue(profileId)
  }, [profileId, profile, setInitialProfileValue])

  useEffect(() => {
    if (suit || !suitId) return

    setInitialSuitValue(suitId)
  }, [suitId, suit, setInitialSuitValue])

  useEffect(() => {
    if (place || !placeId) return

    setInitialPlaceValue(placeId)
  }, [placeId, place, setInitialPlaceValue])

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
