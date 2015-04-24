require 'tracks/views/track_data'

class TrackMapsData < TrackData

  private

  def init_points
    @points = Skyderby::Tracks::Points.new(@track).trimmed.map do |x|
      {latitude: x[:latitude], longitude: x[:longitude], h_speed: x[:h_speed]}
    end
  end
end
