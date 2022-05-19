import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import MarkerClusterer from '@googlemaps/markerclustererplus'
import { Link, useNavigate } from 'react-router-dom'
import cx from 'clsx'
import debounce from 'lodash.debounce'

import Map from 'components/Map'
import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { PlaceRecord, useAllPlacesQuery } from 'api/places'
import { useCurrentUserQuery } from 'api/sessions'
import LocateIcon from 'icons/locate'
import CompassIcon from 'icons/compass'
import PlusIcon from 'icons/plus.svg'
import useCountriesWithPlaces from './useCountriesWithPlaces'
import styles from './styles.module.scss'

const PlacesIndex = () => {
  const navigate = useNavigate()
  const infoWindowRef = useRef()
  const markers = useRef<(google.maps.Marker & { placeId: number })[]>([])
  const [map, setMap] = useState<google.maps.Map | undefined>()
  const [followMap, setFollowMap] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null | undefined>()
  const [selectedPlace, setSelectedPlace] = useState<{
    place: PlaceRecord
    marker: google.maps.Marker
  } | null>(null)
  const google = useGoogleMapsApi()

  const { data: places = [] } = useAllPlacesQuery()
  const countriesWithPlaces = useCountriesWithPlaces(
    places,
    searchTerm,
    followMap ? bounds : undefined
  )

  const { data: currentUser } = useCurrentUserQuery()
  const canCreatePlace = currentUser?.permissions.canCreatePlace
  const positionChangeHandler = debounce(
    (map: google.maps.Map) => setBounds(map.getBounds()),
    200
  )

  useEffect(() => {
    if (!google || !map || places.length === 0) return

    markers.current = places.map(place => {
      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude }
      })
      marker.addListener('click', () => setSelectedPlace({ place, marker }))

      return Object.assign(marker, { placeId: place.id })
    })

    const clusterer = new MarkerClusterer(map, markers.current, {
      gridSize: 50,
      maxZoom: 6,
      imagePath: '/markerclusterer/m'
    })

    return () => {
      clusterer.setMap(null)
      markers.current.forEach(marker => marker.setMap(null))
    }
  }, [map, places, google])

  useEffect(() => {
    if (!google || !selectedPlace) return

    const { place, marker } = selectedPlace
    const infoWindow = infoWindowRef.current ?? new google.maps.InfoWindow()
    infoWindow.setContent(`
      <h2>${place.name}</h2>
      <a id='infowindow-link' href='/places/${place.id}'>See details</a>
    `)
    infoWindow.setPosition({ lat: place.latitude, lng: place.longitude })
    infoWindow.open(map, marker)

    google.maps.event.addListener(infoWindow, 'closeclick', () => setSelectedPlace(null))

    return () => infoWindow.close()
  }, [selectedPlace, setSelectedPlace, google, map])

  useLayoutEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLAnchorElement
      if (target.matches('#infowindow-link')) {
        event.preventDefault()
        const href = target.getAttribute('href')
        href && navigate(href)
      }
    }

    document.addEventListener('click', clickHandler)

    return () => document.removeEventListener('click', clickHandler)
  }, [navigate])

  const zoomTo = useCallback(
    (place: PlaceRecord) => {
      if (!map || !google) return
      map.setZoom(10)
      map.panTo({ lat: place.latitude, lng: place.longitude })

      const marker = markers.current.find(el => el.placeId === place.id)

      if (!marker) return

      marker.setAnimation(google.maps.Animation.BOUNCE)
      setTimeout(() => marker.setAnimation(null), 2000)
    },
    [map, google]
  )

  return (
    <section className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.settings}>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search by name"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
          />
          <button
            className={cx(styles.actionButton, followMap && styles.active)}
            onClick={() => setFollowMap(val => !val)}
          >
            <CompassIcon />
          </button>
          {canCreatePlace && (
            <Link to={'/places/new'} className={styles.fab}>
              <PlusIcon />
            </Link>
          )}
        </div>

        <div className={styles.placesList}>
          {countriesWithPlaces.map(country => (
            <div key={country.id} className={styles.countryPlaces}>
              <h2 className={styles.countryTitle}>{country.name}</h2>
              <ul>
                {country.places.map(place => (
                  <li key={place.id} className={styles.place}>
                    <Link to={`/places/${place.id}`} className={styles.placeName}>
                      {place.name}
                    </Link>
                    <button className={styles.actionButton} onClick={() => zoomTo(place)}>
                      <LocateIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <main className={styles.map}>
        <Map
          afterInitialize={setMap}
          onZoomChanged={positionChangeHandler}
          onCenterChanged={positionChangeHandler}
        />
      </main>
    </section>
  )
}

export default PlacesIndex
