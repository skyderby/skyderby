import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import MarkerClusterer from '@googlemaps/markerclustererplus'
import { Link, useHistory } from 'react-router-dom'
import cx from 'clsx'
import debounce from 'lodash.debounce'

import useGoogleMapsApi from 'utils/useGoogleMapsApi'
import { useAllPlacesQuery } from 'api/hooks/places'
import LocateIcon from 'icons/locate'
import CompassIcon from 'icons/compass'
import useCountriesWithPlaces from './useCountriesWithPlaces'
import styles from './styles.module.scss'

const PlacesIndex = () => {
  const history = useHistory()
  const mapElementRef = useRef()
  const infoWindowRef = useRef()
  const markers = useRef([])
  const [map, setMap] = useState()
  const [followMap, setFollowMap] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [bounds, setBounds] = useState()
  const [selectedPlace, setSelectedPlace] = useState()
  const google = useGoogleMapsApi()

  const { data: places = [] } = useAllPlacesQuery()
  const countriesWithPlaces = useCountriesWithPlaces(
    places,
    searchTerm,
    followMap && bounds
  )

  useEffect(() => {
    if (!google) return

    const options = {
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      center: new google.maps.LatLng(20.0, 20.0)
    }

    const map = new google.maps.Map(mapElementRef.current, options)

    const positionChangeHandler = debounce(() => setBounds(map.getBounds()), 200)

    google.maps.event.addListener(map, 'zoom_changed', positionChangeHandler)
    google.maps.event.addListener(map, 'center_changed', positionChangeHandler)

    setMap(map)
    setBounds(map.getBounds())
  }, [google])

  useEffect(() => {
    if (!map || places.length === 0) return

    markers.current = places.map(place => {
      const marker = new google.maps.Marker({
        position: { lat: place.latitude, lng: place.longitude }
      })
      marker.placeId = place.id
      marker.addListener('click', () => setSelectedPlace({ place, marker }))

      return marker
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
    if (!selectedPlace) return

    const { place, marker } = selectedPlace
    const infoWindow = infoWindowRef.current ?? new google.maps.InfoWindow()
    infoWindow.setContent(`
      <h2>${place.name}</h2>
      <a id="infowindow-link" href="/places/${place.id}">See details</a>
    `)
    infoWindow.setPosition({ lat: place.latitude, lng: place.longitude })
    infoWindow.open(map, marker)

    google.maps.event.addListener(infoWindow, 'closeclick', () => setSelectedPlace(null))

    return () => infoWindow.setMap(null)
  }, [selectedPlace, setSelectedPlace, google, map])

  useLayoutEffect(() => {
    const clickHandler = event => {
      if (event.target.matches('#infowindow-link')) {
        event.preventDefault()
        history.push(event.target.getAttribute('href'))
      }
    }

    document.addEventListener('click', clickHandler)

    return () => document.removeEventListener('click', clickHandler)
  }, [history])

  const zoomTo = place => {
    map.setZoom(10)
    map.panTo({ lat: place.latitude, lng: place.longitude })

    const marker = markers.current.find(el => el.placeId === place.id)

    if (!marker) return

    marker.setAnimation(google.maps.Animation.BOUNCE)
    setTimeout(() => marker.setAnimation(null), 2000)
  }

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
          <Link to={'/places/new'} className={styles.placeName}>
            +
          </Link>
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

      <main className={styles.map} ref={mapElementRef} />
    </section>
  )
}

export default PlacesIndex
