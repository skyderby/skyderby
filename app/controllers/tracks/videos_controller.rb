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

      @track_data = Tracks::VideoPresenter.new(@track)

      respond_to do |format|
        format.html { redirect_to @track unless @track.video }
        format.json
      end
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
