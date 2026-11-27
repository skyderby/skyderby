class Track::Points
  MIN_VERTICAL_SPEED = 0.1 / MS_IN_KMH

  Point = Data.define(
    :gps_time, :fl_time, :time_diff, :latitude, :longitude, :abs_altitude, :elevation, :altitude, :distance,
    :h_speed, :v_speed, :full_speed, :glide_ratio, :horizontal_accuracy, :vertical_accuracy, :speed_accuracy
  ) do
    def self.glide_ratio(h_speed, v_speed) = h_speed / (v_speed.zero? ? MIN_VERTICAL_SPEED : v_speed.abs)

    def [](attribute) = public_send(attribute)

    def fetch(attribute) = public_send(attribute)

    def dig(attribute, *rest) = rest.empty? ? self[attribute] : self[attribute]&.dig(*rest)
  end
end
