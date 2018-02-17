module Tracks
  class GlobeController < ApplicationController
    before_action :authorize_track

    def show
      @track = Track.find(params[:track_id])

      authorize @track

      respond_to do |format|
        format.html { redirect_to @track unless @track.ge_enabled }
        format.json { @globe_data = Tracks::GlobePresenter.new(@track) }
      end
    rescue Pundit::NotAuthorizedError
      redirect_to tracks_url, notice: t('tracks.index.track_not_found', id: params[:track_id])
    end
  end
end
