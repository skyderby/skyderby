require 'tracks/views/track_data'

class TrackMapsData < TrackData

  private

  def init_points
    @points = TrackPoints.new(@track).trimmed.map do |x|
      {latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed]}
    end
  end
end
