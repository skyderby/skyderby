module Tracks
  class VideosController < ApplicationController
    before_action :set_track
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

      @video = @track.video
      return redirect_to @track unless @video

      @points =
        PointsQuery
        .execute(@track,
                 trimmed: { seconds_before_start: 20 },
                 freq_1hz: true,
                 only: %i[gps_time fl_time latitude longitude altitude full_speed h_speed v_speed glide_ratio])
        .then { |raw_points| PointsPostprocessor.for(@track.gps_type).call(raw_points, speed_units: :kmh) }
    end

    def create
      @video = TrackVideo.new(video_params)

      if @video.save
        respond_to do |format|
          format.html { redirect_to @video }
          format.turbo_stream { redirect_to track_video_path }
        end
      else
        respond_to do |format|
          format.html { render :new }
          format.turbo_stream { respond_with_errors @video }
        end
      end
    end

    def update
      @video = @track.video

      if @video.update(video_params)
        respond_to do |format|
          format.html { redirect_to @video }
          format.turbo_stream { redirect_to track_video_path }
        end
      else
        respond_to do |format|
          format.html { render :edit }
          format.turbo_stream { respond_with_errors @video }
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
