class TrackEarthData
  attr_reader :track, :points

  def initialize(track)
    @track = track
    @points = []

    init_points    
  end

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
