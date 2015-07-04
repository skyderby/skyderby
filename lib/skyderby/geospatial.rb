module Skyderby
  class Geospatial
    RAD_PER_DEG = Math::PI / 180
    DEG_PER_RAD = 180 / Math::PI

    # Equatorial Radius, WGS84
    EQUATORIAL_RADIUS = 6378137.0
    POLAR_RADIUS = 6356752.3142
    RATIO = POLAR_RADIUS / EQUATORIAL_RADIUS
    ECCENT = Math.sqrt(1.0 - RATIO ** 2)
    COM = ECCENT / 2

    class << self
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
        rkm = 6371                  # Радиус земли в километрах
        rm = rkm * 1000

        dlon_rad = (b[1] - a[1]) * RAD_PER_DEG
        dlat_rad = (b[0] - a[0]) * RAD_PER_DEG

        lat1_rad, lon1_rad = a.map! { |i| i * RAD_PER_DEG }
        lat2_rad, lon2_rad = b.map! { |i| i * RAD_PER_DEG }

        a = Math.sin(dlat_rad / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
        c = 2 * Math.asin(Math.sqrt(a))

        rm * c # Distance in meters
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

      private

      def deg_to_rad(angle)
        angle * RAD_PER_DEG
      end

      def rad_to_deg(angle)
        angle * DEG_PER_RAD
      end

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
end
