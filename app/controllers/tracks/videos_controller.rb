module Tracks
  class VideosController < ApplicationController
    before_action :set_track, :set_chart_data
    before_action :authorize_edit, except: :show

    def new
      (redirect_to action: :edit && return) if @track.video

      default_values = { track_offset: @track.ff_start, track_id: @track.id }
      @video = TrackVideo.new(default_values)
    end

    def edit
      @video = @track.video
    end

    def show
      authorize @track

      redirect_to @track unless @track.video
      @track_data = Tracks::VideoPresenter.new(@track)
    end

    def create
      @video = TrackVideo.new(video_params)

      if @video.save
        respond_to do |format|
          format.html { redirect_to @video }
          format.js
        end
      else
        respond_to do |format|
          format.html { render :new }
          format.js
        end
      end
    end

    def update
      @video = @track.video

      if @video.update(video_params)
        respond_to do |format|
          format.html { redirect_to @video }
          format.js { @track_data = Tracks::VideoPresenter.new(@track) }
        end
      else
        respond_to do |format|
          format.html { render :edit }
          format.js { render template: 'errors/ajax_errors', locals: { errors: errors } }
        end
      end
    end

    def destroy
      @track.video.destroy
      redirect_to @track
    end

    private

    def set_track
      @track = Track.find(params[:track_id])
    end

    def authorize_edit
      authorize @track, :edit?
    end

    def set_chart_data
      start_time_in_seconds = @track.points.first.gps_time_in_seconds.to_f
      @points =
        begin
          raw_points = @track.points.trimmed(seconds_before_start: 20).freq_1Hz.pluck_to_hash(
            "gps_time_in_seconds - #{start_time_in_seconds} AS fl_time",
            'gps_time_in_seconds AS gps_time',
            "#{@track.point_altitude_field} AS altitude",
            :latitude,
            :longitude,
            :h_speed,
            :v_speed,
            'CASE WHEN v_speed = 0 THEN h_speed / 0.1
                  ELSE h_speed / ABS(v_speed)
            END AS glide_ratio'
          )
          PointsPostprocessor.for(@track.gps_type).new(raw_points).execute
        end
    end

    def video_params
      params.require(:track_video).permit(
        :track_id,
        :url,
        :video_code,
        :video_offset,
        :track_offset
      )
    end
  end
end
