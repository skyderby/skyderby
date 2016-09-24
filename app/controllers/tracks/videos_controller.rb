class Tracks::VideosController < ApplicationController
  load_resource :track
  before_filter :authorize_track

  def new
		@video = TrackVideo.new
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
