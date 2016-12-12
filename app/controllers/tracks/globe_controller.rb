class Tracks::GlobeController < ApplicationController
  load_resource :track
  before_action :authorize_track

  def show
    respond_to do |format|
      format.html { redirect_to @track unless @track.ge_enabled }
      format.json { @globe_data = Tracks::GlobePresenter.new(@track) }
    end
  end

  private

  def authorize_track
    authorize! :show, @track 
  end
end
