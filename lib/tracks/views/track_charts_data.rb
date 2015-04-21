require 'tracks/views/track_data'

class TrackChartsData < TrackData
  def initialize(track, param_from, param_to)
    @track = track
    @points = []

    init_points

    @param_from = param_from
    @param_to = param_to
  end

  def to_data_attr
    {
      points: @points.to_json, 
      height: {
        max: @max_height, 
        min: @min_height
      },
      params: {
        from: @param_from || -1,
        to: @param_to || -1
      }.to_json
    }
  end

  private

  def init_points
    tr_points = TrackPoints.new(@track)

    @points = tr_points.trimmed
    @min_height = tr_points.min_h
    @max_height = tr_points.max_h
  end
end
