class Tracks::VideosController < ApplicationController
  load_resource :track
  before_filter :authorize_track

  def new
		@video = TrackVideo.new(track_offset: @track.ff_start)
    start_time_in_seconds = @track.points.first.gps_time_in_seconds.to_f
    @points = 
        @track.points.trimmed(seconds_before_start: 20).freq_1Hz.pluck_to_hash(
          "gps_time_in_seconds - #{start_time_in_seconds} AS fl_time",
          "#{@track.point_altitude_field} AS altitude",
          :h_speed,
          :v_speed,
          'CASE WHEN v_speed = 0 THEN h_speed / 0.1
                ELSE h_speed / ABS(v_speed)
          END AS glide_ratio')
  end

  def show
    redirect_to @track unless @track.video 
    @track_data = Tracks::VideoPresenter.new(@track)
  end

  private

  def authorize_track
    authorize! :show, @track 
  end
end
