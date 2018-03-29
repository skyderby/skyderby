import Geospatial from 'utils/geospatial'

export default function(google, map, width, length, direction = 0) {
  const DLOverlay = class extends google.maps.OverlayView {
    constructor(map, width, length, direction) {
      super()

      this._map = map
      this.width = width
      this.length = length
      this.direction = direction

      this.set_bounds(this.map_center)
      this.center_marker = this.create_center_marker()
      this.rotate_marker = this.create_rotate_marker()

      this._div = null
    }

    show() {
      this.setMap(this._map)
      this.center_marker.setMap(this._map)
      this.rotate_marker.setMap(this._map)
    }

    hide() {
      this.setMap(null)
      this.center_marker.setMap(null)
      this.rotate_marker.setMap(null)
    }

    onAdd() {
      let div = this.create_div()
      let img = this.create_img()

      div.appendChild(img)

      this._div = div

      this.panes.overlayLayer.appendChild(div)
    }

    onRemove() {
      this._div.parentNode.removeChild(this._div);
    }

    draw() {
      let overlayProjection = this.getProjection();
      let sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
      let ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());

      let div = this._div
      div.style.left = `${sw.x}px`
      div.style.top = `${ne.y}px`
      div.style.height = `${sw.y - ne.y}px`
      div.style.width = `${ne.x - sw.x}px`
      div.style.transform = `rotate(${this.direction}deg)`
    }

    create_div() {
      let div = document.createElement('div')
      div.style.borderStyle = 'none'
      div.style.borderWidth = '0px'
      div.style.position = 'absolute'

      return div
    }

    create_img() {
      let img = document.createElement('img')
      img.src = this.image_src
      img.style.width = '100%'
      img.style.height = '100%'
      img.style.opacity = '0.5'
      img.style.position = 'absolute'

      return img
    }

    create_center_marker() {
      let icon = {
        path: 'M 0, 0 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
        fillOpacity: 0.5,
        strokeWeight: 0,
        fillColor: '#345995',
        scale: 0.2
      }

      let marker = new google.maps.Marker({
        position: this.map_center,
        map: map,
        draggable: true,
        icon: icon
      })

      google.maps.event.addListener(marker, 'drag', () => {
        this.set_bounds(marker.getPosition())
        this.rotate_marker.setPosition(this.rotate_marker_position)
      })

      return marker
    }

    create_rotate_marker() {
      let icon = {
        path: 'M 0, 0 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0',
        fillOpacity: 0.5,
        strokeWeight: 2,
        scale: 0.1
      }

      let marker = new google.maps.Marker({
        position: this.rotate_marker_position,
        map: map,
        draggable: true,
        icon: icon
      })

      google.maps.event.addListener(marker, 'drag', () => {
        let center_position = this.center_marker.getPosition()
        let marker_position = marker.getPosition()

        let lat_diff = marker_position.lat() - center_position.lat()
        let lon_diff = marker_position.lng() - center_position.lng()

        this.direction = (Math.atan2(lon_diff, lat_diff) * 180 / Math.PI).toFixed()

        this.draw()
      })

      google.maps.event.addListener(marker, 'dragend', () => {
        marker.setPosition(this.rotate_marker_position)
      })

      return marker
    }

    set_bounds(point) {
      let center_lat = point.lat()
      let center_lon = point.lng()

      let top_point    = Geospatial.destiantion_by_bearing_and_distance(center_lat, center_lon, 0, this.length / 2)
      let bottom_point = Geospatial.destiantion_by_bearing_and_distance(center_lat, center_lon, 180, this.length / 2)
      let right_point  = Geospatial.destiantion_by_bearing_and_distance(center_lat, center_lon, 90, this.width / 2)
      let left_point   = Geospatial.destiantion_by_bearing_and_distance(center_lat, center_lon, 270, this.width / 2)

      let south_west = new google.maps.LatLng(bottom_point['latitude'], left_point['longitude'])
      let north_east = new google.maps.LatLng(top_point['latitude'], right_point['longitude'])

      this.bounds = new google.maps.LatLngBounds(south_west, north_east)
    }

    get rotate_marker_position() {
      let center = this.center_marker.getPosition()
      let angle = this.direction

      let { latitude, longitude } = Geospatial.destiantion_by_bearing_and_distance(
        center.lat(),
        center.lng(),
        angle,
        this.length / 2
      )

      return new google.maps.LatLng(latitude, longitude)
    }

    get map_center() {
      return this._map.getCenter()
    }

    get panes() {
      return this.getPanes()
    }

    get image_src() {
      return '/designated-lane.png'
    }
  }

  return new DLOverlay(map, width, length, direction)
}
