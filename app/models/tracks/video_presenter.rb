class Tracks::VideoPresenter
  attr_reader :track

  delegate :video_code, to: :video
  delegate :video_offset, to: :video
  delegate :track_offset, to: :video

  def initialize(track)
    @track = track
    @video = track.video
  end

  def to_data_attr
    {
      video_code: video_code,
      video_offset: video_offset,
      track_offset: track_offset,
      points: track_points.to_json.html_safe
    }
  end

  private

  attr_reader :video

  def track_points
    @points ||= 
      begin
        start_time_in_seconds = @track.points.first.gps_time_in_seconds.to_f
        @track.points.trimmed.pluck_to_hash(
          "gps_time_in_seconds - #{start_time_in_seconds} AS fl_time",
          "#{@track.point_altitude_field} AS altitude",
          :h_speed,
          :v_speed,
          'CASE WHEN v_speed = 0 THEN h_speed / 0.1
                ELSE h_speed / ABS(v_speed)
          END AS glide_ratio')
      end
  end
end
