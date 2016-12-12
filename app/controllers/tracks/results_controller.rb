class Tracks::ResultsController < ApplicationController
  load_resource :track
  before_action :authorize_track

  def show
    respond_to do |format|
      format.html { redirect_to @track }
      format.js
    end
  end

  private

  def authorize_track
    authorize! :show, @track 
  end
end
