export default class Geospatial {
  static EARTH_RADIUS = 6378137 // in meters

  static radians(n) {
    return n * (Math.PI / 180)
  }

  static degrees(n) {
    return n * (180 / Math.PI)
  }

  static normalize_angle(n) {
    let angle = Number(n)
    return (angle + 360) % 360
  }

  static destiantion_by_bearing_and_distance(latitude_deg, longitude_deg, bearing_deg, distance) {
    const start_lat = this.radians(latitude_deg),
      start_lon = this.radians(longitude_deg),
      bearing = this.radians(bearing_deg)

    const dest_lat = Math.asin(
      Math.sin(start_lat) * Math.cos(distance / this.EARTH_RADIUS) +
        Math.cos(start_lat) * Math.sin(distance / this.EARTH_RADIUS) * Math.cos(bearing)
    )

    const dest_lon = start_lon + Math.atan2(
      Math.sin(bearing) * Math.sin(distance / this.EARTH_RADIUS) * Math.cos(start_lat),
      Math.cos(distance / this.EARTH_RADIUS) - Math.sin(start_lat) * Math.sin(dest_lat)
    )

    return {
      latitude: this.degrees(dest_lat),
      longitude: this.degrees(dest_lon)
    }
  }

  static bearing(start_lat_deg, start_lon_deg, end_lat_deg, end_lon_deg) {
    const start_lat = this.radians(start_lat_deg),
      start_lon = this.radians(start_lon_deg),
      end_lat = this.radians(end_lat_deg),
      end_lon = this.radians(end_lon_deg)

    let d_lon = end_lon - start_lon

    const d_phi = Math.log(
      Math.tan(end_lat / 2.0 + Math.PI / 4.0) /
        Math.tan(start_lat / 2.0 + Math.PI / 4.0)
    )

    if (Math.abs(d_lon) > Math.PI) {
      if (d_lon > 0.0) {
        d_lon = -(2.0 * Math.PI - d_lon)
      } else {
        d_lon = (2.0 * Math.PI + d_lon)
      }
    }

    return this.normalize_angle(this.degrees(Math.atan2(d_lon, d_phi)))
  }

  static distance(lat1_deg, lon1_deg, lat2_deg, lon2_deg) {
    const lat1 = this.radians(lat1_deg),
      lat2 = this.radians(lat2_deg),
      lon1 = this.radians(lon1_deg),
      lon2 = this.radians(lon2_deg)

    const d_lat = lat2 - lat1
    const d_lon = lon2 - lon1

    const a = Math.sin(d_lat / 2) * Math.sin(d_lat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(d_lon / 2) * Math.sin(d_lon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return this.EARTH_RADIUS * c
  }
}
