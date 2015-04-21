module Geospatial
  def self.distance_between_points(a, b)
    distance(
      [a.latitude, a.longitude],
      [b.latitude, b.longitude]
    )
  end

  def self.distance(a, b)
    rad_per_deg = Math::PI/180  # PI / 180
    rkm = 6371                  # Радиус земли в километрах
    rm = rkm * 1000

    dlon_rad = (b[1]-a[1]) * rad_per_deg
    dlat_rad = (b[0]-a[0]) * rad_per_deg

    lat1_rad, lon1_rad = a.map! {|i| i * rad_per_deg }
    lat2_rad, lon2_rad = b.map! {|i| i * rad_per_deg }

    a = Math.sin(dlat_rad/2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad/2)**2
    c = 2 * Math.asin(Math.sqrt(a))

    rm * c # Расстояние в метрах
  end
end
