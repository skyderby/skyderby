class Tracks::VideoPresenter
  attr_reader :track

  delegate :video_code, to: :video
  delegate :video_offset, to: :video
  delegate :track_offset, to: :video

  def initialize(track)
    @track = track
    @video = track.video
  end

  def points
    @points ||= PointsQuery
      .execute(@track,
               trimmed: { seconds_before_start: 20 },
               freq_1hz: true,
               only: %i[gps_time fl_time latitude longitude altitude h_speed v_speed glide_ratio])
      .then { |raw_points| PointsPostprocessor.for(track.gps_type).call(raw_points, speed_units: :kmh) }
  end

  private

  attr_reader :video
end
