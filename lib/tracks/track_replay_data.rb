class TrackReplayData
  attr_reader :track, :points, :video_code, :video_offset, :track_offset

  def initialize(track)
    @track = track
    @video_code = track.video.video_code
    @video_offset = track.video.video_offset
    @track_offset = track.video.track_offset
    @points = []

    init_points
  end

  def to_data_attr
    {
      video_code: @video_code,
      video_offset: @video_offset,
      track_offset: @track_offset,
      points: @points.to_json.html_safe
    }
  end

  private

  def init_points
    @points = TrackPoints.new(@track).trimmed.map do |point|
      point.slice(:fl_time_abs, :elevation, :h_speed, :v_speed, :glrat)
    end
  end
end
