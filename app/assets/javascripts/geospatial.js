Geospatial = {
  EARTH_RADIUS: 6378137, // in meters

  radians: function(n) {
    return n * (Math.PI / 180);
  },

  degrees: function(n) {
    return n * (180 / Math.PI);
  },

  destiantion_by_bearing_and_distance: function(latitude_deg, longitude_deg, bearing, distance) {
    var start_lat = this.radians(latitude_deg),
        start_lon = this.radians(longitude_deg);

    var dest_lat = Math.asin( 
      Math.sin(start_lat) * Math.cos(distance / this.EARTH_RADIUS) +
        Math.cos(start_lat) * Math.sin(distance / this.EARTH_RADIUS) * Math.cos(bearing)
    );

    var dest_lon = start_lon + Math.atan2(
      Math.sin(bearing) * Math.sin(distance / this.EARTH_RADIUS) * Math.cos(start_lat),
      Math.cos(distance / this.EARTH_RADIUS) - Math.sin(start_lat) * Math.sin(dest_lat)
    );

    return {
      latitude: this.degrees(dest_lat),
      longitude: this.degrees(dest_lon)
    };
  },

  bearing: function(start_lat_deg, start_lon_deg, end_lat_deg, end_lon_deg) {
    var start_lat = this.radians(start_lat_deg),
        start_lon = this.radians(start_lon_deg),
        end_lat = this.radians(end_lat_deg),
        end_lon = this.radians(end_lon_deg);

    var d_lon = end_lon - start_lon;

    var d_phi = Math.log(Math.tan(end_lat / 2.0 + Math.PI / 4.0) / Math.tan(start_lat / 2.0 + Math.PI / 4.0));
    if (Math.abs(d_lon) > Math.PI){
        if (d_lon > 0.0)
            d_lon = -(2.0 * Math.PI - d_lon);
        else
            d_lon = (2.0 * Math.PI + d_lon);
    }

    return (this.degrees(Math.atan2(d_lon, d_phi)) + 360.0) % 360.0;
  },

};
