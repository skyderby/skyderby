require 'tracks/views/track_data'

class TrackEarthData < TrackData

  private

  def init_points
    @points = TrackPoints.new(@track).trimmed.map do |x|
      {
        latitude: x[:latitude],
        longitude: x[:longitude],
        h_speed: x[:h_speed],
        elevation: x[:abs_altitude].nil? ? x[:elevation] : x[:abs_altitude]
      }
    end
  end
end
