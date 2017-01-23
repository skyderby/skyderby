class Tracks::GlobeController < ApplicationController
  load_resource :track
  before_action :authorize_track

  def show
    respond_to do |format|
      format.html { redirect_to @track unless @track.ge_enabled }
      format.json { @globe_data = Tracks::GlobePresenter.new(@track) }
    end
  end

  rescue_from CanCan::AccessDenied do |_exception|
    redirect_to tracks_url, notice: t('tracks.index.track_not_found',
                                      id: params[:track_id])
  end

  private

  def authorize_track
    authorize! :show, @track 
  end
end
