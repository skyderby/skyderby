class TrackData
  attr_reader :track, :points

  def initialize(track)
    @track = track
    @points = []

    init_points
  end

  private

  def init_points
  end
end
