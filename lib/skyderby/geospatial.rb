module Skyderby
  module Geospatial
    extend self
    extend Skyderby::Trigonometry

    # Earth's radius
    EARTH_RADIUS_M = 6371000

    # Equatorial Radius, WGS84
    EQUATORIAL_RADIUS = 6378137.0
    POLAR_RADIUS = 6356752.3142
    RATIO = POLAR_RADIUS / EQUATORIAL_RADIUS
    ECCENT = Math.sqrt(1.0 - RATIO ** 2)
    COM = ECCENT / 2

    # Method calculates distance between two points that defined
    # as objects with getter methods latitude and longitude.
    # For example Struct.new(:latitude, :longitude)
    def distance_between_points(a, b)
      distance(
        [a.latitude, a.longitude],
        [b.latitude, b.longitude]
      )
    end

    # Method calculates distance between points defined
    # by coordinates.
    # Method uses Havershine formula.
    # Coordinates must be defined as array of two numbers
    # [latitude, longitude]
    def distance(a, b)
      dlon_rad = deg_to_rad(b[1] - a[1])
      dlat_rad = deg_to_rad(b[0] - a[0])

      lat1_rad, lon1_rad = a.map! { |i| deg_to_rad(i) }
      lat2_rad, lon2_rad = b.map! { |i| deg_to_rad(i) }

      a = Math.sin(dlat_rad / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
      c = 2 * Math.asin(Math.sqrt(a))

      EARTH_RADIUS_M * c # Distance in meters
    end

    def coordinates_to_mercator(latitude, longitude)
      {
        x: longitude_to_merc_x(longitude).round(4),
        y: latitude_to_merc_y(latitude).round(4)
      }
    end

    def mercator_to_coordinates(x, y)
      {
        latitude: merc_y_to_latitude(y).round(10),
        longitude: merc_x_to_longitude(x).round(10)
      }
    end

    # Given a start point, initial bearing, and distance, this will calculate
    # the destination point and final bearing travelling along a 
    # (shortest distance) great circle arc.
    # http://www.movable-type.co.uk/scripts/latlong.html
    def shift_position(orig_lat_deg, orig_lon_deg, distance, bearing)
      orig_lat_rad = deg_to_rad(orig_lat_deg.to_f)
      orig_lon_rad = deg_to_rad(orig_lon_deg.to_f)
      angular_dist = distance.to_f / EARTH_RADIUS_M
      bearing_rad = deg_to_rad(bearing.to_f)

      dest_lat_rad =
        Math.asin( 
          Math.sin(orig_lat_rad) * Math.cos(angular_dist) +
          Math.cos(orig_lat_rad) * Math.sin(angular_dist) * Math.cos(bearing_rad)
        )

      atan2_x = Math.cos(angular_dist) - Math.sin(orig_lat_rad) * Math.sin(dest_lat_rad)
      atan2_y = Math.sin(bearing_rad) * Math.sin(angular_dist) * Math.cos(orig_lat_rad)
      dest_lon_rad = orig_lon_rad + Math.atan2(atan2_y, atan2_x)

      dest_lat_deg = normalize_angle(rad_to_deg(dest_lat_rad)).round(10)

      dest_lon_deg = normalize_angle(rad_to_deg(dest_lon_rad)).round(10)

      {
        latitude: dest_lat_deg,
        longitude: dest_lon_deg
      }
    end

    private

    def longitude_to_merc_x(longitude)
      EQUATORIAL_RADIUS * deg_to_rad(longitude)
    end

    def latitude_to_merc_y(latitude)
      latitude = [89.5, [latitude, -89.5].max].min
      phi = deg_to_rad(latitude)
      sinphi = Math.sin(phi)
      con = ECCENT * sinphi
      con = ((1.0 - con) / (1.0 + con)) ** COM
      ts = Math.tan(0.5 * (Math::PI * 0.5 - phi)) / con

      0 - EQUATORIAL_RADIUS * Math.log(ts)
    end

    def merc_x_to_longitude(x)
      rad_to_deg(x) / EQUATORIAL_RADIUS
    end

    def merc_y_to_latitude(y)
      ts = Math.exp(-y / EQUATORIAL_RADIUS)
      phi = Math::PI / 2 - 2 * Math.atan(ts)
      dphi = 1.0
      i = 0
      while dphi.abs > 0.000000001 && i < 15 do
        con = ECCENT * Math.sin(phi);
        dphi = Math::PI / 2 - 2 * Math.atan(ts * (((1.0 - con) / (1.0 + con)) ** COM)) - phi
        phi += dphi
      end

      rad_to_deg(phi)
    end
  end
end
